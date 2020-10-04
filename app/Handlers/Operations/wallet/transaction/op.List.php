<?php

namespace App\Handlers\Operations\Wallet\Transaction;

use Iridium\Core\{
	Http\Filter\ValueType,
	Http\HTTP,
	Dispatcher\Operation
};

use Iridium\Modules\MySql\MySql;
use App\Classes\UserSession;
use App\Restrictions\{LoginRestriction, NotLockRestriction};


/**
 * Операция получения списка транзакций.
 * @package App\Handlers\Operations\Wallet\Transaction
 */
final class ListOperation extends Operation
{
	protected function Prepare()
	{
		parent::Prepare();
		$this->Require(new LoginRestriction);
		$this->Require(new NotLockRestriction);
	}

	protected function Process()
	{
		$address   = HTTP::GetPost('addr', ValueType::STRING, '');
		$direction = HTTP::GetPost('dir', ValueType::STRING, '');
		$num       = HTTP::GetPost('num', ValueType::UINT, 5);
		$page      = HTTP::GetPost('page', ValueType::UINT, 0);
		$move      = HTTP::GetPost('move', ValueType::INT, 0);
		$uid       = UserSession::GetInstance()->GetUser()->id;

		$userAddresses = MySql::GetRows("SELECT `address`, `label` FROM `user_addresses` WHERE `user_id` = '{$uid}';");

		foreach($userAddresses as $addr)
		{
			if($address === $addr['address'])
			{
				$userAddresses = [$addr];
				break;
			}
		}

		$addressesStr = implode(',', array_map( function($addr) { return "'{$addr['address']}'"; }, $userAddresses));

		$additionaSelect = '';
		$additionalGroup = '';

		if($direction === 'in' || $direction === 'out')
		{
			$additionaSelect = '
, SUM(case when io.type = 0 then 1 else 0 end) as in_count, SUM(case when io.type = 1 then 1 else 0 end) as out_count, t.`generated`
			';

			$additionalGroup = 'GROUP BY t.`txid`';

			if($direction === 'in') // Входящая транзакция
			{
				$additionalGroup .= ' HAVING t.`generated` = 1 OR in_count = 0 AND out_count > 0';
			}
			else if($direction === 'out') // Исходящая транзакция
			{
				$additionalGroup .= ' HAVING t.`generated` = 0 AND in_count > 0';
			}
		}

		$totalQuery = "
SELECT COUNT(DISTINCT t.`txid`)$additionaSelect
FROM
	`transactions` as t,
	`transaction_ins_outs` as io
WHERE
	t.`txid` = io.`txid` AND
	io.`address` IN ($addressesStr)
$additionalGroup";

		if($direction === 'in' || $direction === 'out')
		{
			$totalQuery = "SELECT COUNT(*) FROM (" . $totalQuery . ") as t;";
		}

		$total = MySql::GetCell($totalQuery . ';');

		if($total != 0 && $num > $total)
		{
			$num = $total;
		}

		$pages = CalculatePagesCount($total, $num);
		$page  = MovePage($page, $pages, $move);
		$skip  = $page * $num;

		$transactionsData = MySql::GetRows("
SELECT
	DISTINCT t.`txid`,
	t.`generated`,
	t.`fee`,
	UNIX_TIMESTAMP(t.`timestamp`) as `ts`
	$additionaSelect
FROM
	`transactions` as t,
	`transaction_ins_outs` as io
WHERE
	t.`txid` = io.`txid` AND
	io.`address` IN ($addressesStr)
$additionalGroup
ORDER BY `ts` DESC
LIMIT $skip,$num;
		");

		if(empty($transactionsData))
		{
			HTTP::SendJsonResponse(
				[
					'list' => [],
					'page' => 0,
					'pages' => 0
				]
			);

			return;
		}

		$txids     = implode(',', array_map(function($txData) { return "'{$txData['txid']}'"; }, $transactionsData));
		$inoutData = MySql::GetRows("SELECT * FROM `transaction_ins_outs` WHERE `txid` IN ($txids) AND `address` IN ($addressesStr);");

		$transactions = [];

		foreach($transactionsData as $txData)
		{
			$ins = [];
			$outs = [];
			$first = null;

			foreach($inoutData as $ioData)
			{
				if($ioData['txid'] == $txData['txid'])
				{
					if(empty($fisrt))
					{
						$first = $ioData;
					}

					if($ioData['type'] == 0) // in
					{
						$ins[] = $ioData;
					}
					else if($ioData['type'] == 1) // out
					{
						$outs[] = $ioData;
					}
				}
			}

			$transactionData              = new \stdClass();
			$transactionData->txid        = $txData['txid'];
			$transactionData->timestamp   = $txData['ts'];
			$transactionData->humanTime   = HumanTimeFormat($txData['ts']);
			$transactionData->machineTime = MachineTimeFormat($txData['ts']);
			$transactionData->generated   = (bool)$txData['generated'];
			$transactionData->address     = $first['address'];

			foreach($userAddresses as $addr)
			{
				if($addr['address'] === $first['address'])
				{
					$transactionData->addressLabel = $addr['label'];
					break;
				}
			}

			if($transactionData->generated)
			{
				$transactionData->direction = 'in';
				$transactionData->amount    = round($txData['fee'], 8);
			}
			else
			{
				$transactionData->fee = round($txData['fee'], 8);

				$insCount  = count($ins);
				$outsCount = count($outs);

				$outsSum = array_sum(
					array_map(
						function($el)
						{
							return $el['amount'];
						}, $outs
					)
				);

				if($outsCount > 0 && $insCount === 0)
				{
					// Транзакция получения
					// Определяется на основании отсутсвия адреса пользователя в $ins и присутствия в $outs

					$transactionData->direction = 'in';
					$transactionData->amount    = round($outsSum, 8);
				}
				else if($insCount > 0) // Исходящая транзакция
				{
					// Исходящая транзакция

					$transactionData->direction = 'out';

					$insSum = array_sum(
						array_map(
							function($el)
							{
								return $el['amount'];
							}, $ins
						)
					);

					$transactionData->amount = round($insSum - $outsSum - $txData['fee'], 8);
				}
			}

			$transactions[] = $transactionData;
		}

		HTTP::SendJsonResponse([
			'list'  => $transactions,
			'page'  => $page,
			'pages' => $pages
		]);
	}
}