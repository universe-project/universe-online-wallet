<?php

namespace App\Handlers\Operations\Wallet\Address;

use Iridium\Core\{
	Http\Filter\ValueType,
	Http\HTTP,
	Dispatcher\Operation
};

use Iridium\Modules\MySql\MySql;
use App\Classes\{Universe, UserSession};
use App\Restrictions\LoginRestriction;


/**
 * Операция получения списка адресов.
 * @package App\Handlers\Operations\Wallet\Address
 */
final class ListOperation extends Operation
{
	protected function Prepare()
	{
		parent::Prepare();
		$this->Require(new LoginRestriction());
	}

	protected function Process()
	{
		$full   = HTTP::GetPost('full', ValueType::BOOL, false);
		$hidden = HTTP::GetPost('hidden', ValueType::BOOL, true);
		$fields = '`address`';

		if($full)
		{
			$fields .= ', `label`, `hidden`';
		}

		$uid           = UserSession::GetInstance()->GetUser()->id;
		$addressesData = MySql::GetRows("SELECT {$fields} FROM `user_addresses` WHERE `user_id` = '{$uid}' " . ($hidden ? '' : 'AND `hidden` = 0 ') . "ORDER BY `hidden` ASC;");
		$addresses     = [];

		foreach($addressesData as $addrData)
		{
			if($full)
			{
				$address          = new \stdClass();
				$address->address = $addrData['address'];
				$address->hidden  = (bool)$addrData['hidden'];
				$address->label   = $addrData['label'];

				$unspentOuts = (new Universe())->GetUnspentOuts(0, 9999999, [$address->address]);
				$address->amount = round(array_sum(
					array_map(
						function($uout)
						{
							return $uout->amount;
						}, $unspentOuts
					)
				), 8);

				$addresses[] = $address;
			}
			else
			{
				$addresses[] = $addrData['address'];
			}
		}

		HTTP::SendJsonResponse($addresses);
	}
}