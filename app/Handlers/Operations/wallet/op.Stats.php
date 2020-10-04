<?php

namespace App\Handlers\Operations\Wallet;

use Iridium\Core\{Http\HTTP, Dispatcher\Operation};
use Iridium\Modules\MySql\MySql;
use App\Classes\UserSession;
use App\Restrictions\LoginRestriction;


/**
 * Операция получения статистики по кошельку.
 * @package App\Handlers\Operations\Wallet
 */
final class StatsOperation extends Operation
{
	protected function Prepare()
	{
		parent::Prepare();
		$this->Require(new LoginRestriction);
	}

	protected function Process()
	{
		$addresses = UserSession::GetInstance()->GetUser()->GetAddressList();
		$addressesStr = implode(',', array_map(function($addr)
		{
			return "'$addr'";
		}, $addresses));

		$in      = 0;
		$out     = 0;
		$balance = 0;

		if(!empty($addressesStr))
		{
			// Приход - сумма по всем выходам транзакций на адреса пользователя
			// Расход - сумма по всем входам транзакций на адреса пользователя
			//$in      = (float)MySql::GetCell("SELECT SUM(`amount`) FROM `transaction_ins_outs` WHERE `address` IN ($addressesStr) AND `type` = 1;");
			//$out     = (float)MySql::GetCell("SELECT SUM(`amount`) FROM `transaction_ins_outs` WHERE `address` IN ($addressesStr) AND `type` = 0;");

			$generated = (float)MySql::GetCell("
SELECT SUM(`amount`) FROM (SELECT
  	t.`generated`,
    SUM(IF(io.`type` = 0, io.`amount` * -1, io.`amount`)) as `amount`
FROM
    `transactions` as t,
    `transaction_ins_outs` as io
WHERE
     t.`txid` = io.`txid`
     AND io.`address` IN ($addressesStr)
GROUP BY io.`txid`
HAVING t.`generated` = 1) as temp;
			");

			$in      = $this->GetSum(true, $addressesStr) + $generated;
			$out     = $this->GetSum(false, $addressesStr);
			$balance = $in - $out;
		}

		HTTP::SendJsonResponse([
			'in' => $in,
			'out' => $out,
			'balance' => $balance,
			'humanTime' => HumanTimeFormat(TIMESTAMP),
			'machineTime' => MachineTimeFormat(TIMESTAMP)
		]);
	}

	private function GetSum(bool $direction, string $addrStr)
	{
		if($direction)
		{
			// Приход (без добычи)
			$having = "in_count = 0 AND out_count > 0";
			$amount = "SUM(io.`amount`) as `amount`";
		}
		else
		{
			// Расход
			$having = "t.`generated` = 0 AND in_count > 0";
			$amount = "SUM(IF(io.`type` = 0, io.`amount`, io.`amount` * -1)) as `amount`";
		}

		$query = "
SELECT SUM(`amount`)
FROM(
	SELECT
		SUM(case when io.type = 0 then 1 else 0 end) as in_count,
		SUM(case when io.type = 1 then 1 else 0 end) as out_count,
		t.`generated`,
		$amount
	FROM
		`transactions` as t,
		`transaction_ins_outs` as io
	WHERE
		t.`txid` = io.`txid`
		AND io.`address` IN ($addrStr)
	GROUP BY io.`txid`
	HAVING $having
) as temp;
		";

		return (float)MySql::GetCell($query);
	}
}