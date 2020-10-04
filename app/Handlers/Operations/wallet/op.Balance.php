<?php

namespace App\Handlers\Operations\Wallet;

use Iridium\Core\{
	Http\HTTP,
	Log\Log,
	Dispatcher\Operation
};

use App\Classes\{Universe, UserSession};
use App\Restrictions\LoginRestriction;


final class BalanceOperation extends Operation
{
	protected function Prepare()
	{
		parent::Prepare();
		$this->Require(new LoginRestriction);
	}

	protected function Process()
	{
		$userAddresses = UserSession::GetInstance()->GetUser()->GetAddressList();

		$raw       = 0;
		$confirmed = 0;
		$mature    = 0;

		Log::Debug('Операция запроса баланса.');

		if(!empty($userAddresses))
		{
			$unspentOuts = (new Universe())->GetUnspentOuts(0, 9999999, $userAddresses);

			foreach($unspentOuts as $out)
			{
				$raw += $out->amount;

				if($out->confirmations >= $GLOBALS['config']['confirmation'])
				{
					$confirmed += $out->amount;

					if($out->confirmations >= $GLOBALS['config']['maturation'])
					{
						$mature += $out->amount;
					}
				}
			}
		}

		HTTP::SendJsonResponse(
			[
				'raw'       => $raw,
				'confirmed' => $confirmed,
				'mature'    => $mature
			]
		);
	}
}