<?php

namespace App\Handlers\Operations\Wallet\Address;

use Iridium\Core\{
	Exceptions\OperationException,
	Http\HTTP,
	Dispatcher\Operation
};

use Iridium\Modules\Lang\Lang;
use Iridium\Modules\MySql\MySql;
use App\Classes\{Universe, UserSession};
use App\Restrictions\{LoginRestriction, NotLockRestriction};


/**
 * Операция создания нового адреса.
 * @package App\Handlers\Operations\Wallet\Address
 */
final class CreateOperation extends Operation
{
	protected function Prepare()
	{
		parent::Prepare();
		$this->Require(new LoginRestriction);
		$this->Require(new NotLockRestriction);
	}

	protected function Process()
	{
		$uid = UserSession::GetInstance()->GetUser()->id;

		if(MySql::GetCell("SELECT COUNT(*) FROM `user_addresses` WHERE `user_id` = '{$uid}';") >= $GLOBALS['config']['user']['max_addresses'])
		{
			throw new OperationException($this, sprintf(Lang::GetDictionary()->FindPhrase('addr.err.limit'), $GLOBALS['config']['user']['max_addresses']));
		}

		$uid     = UserSession::GetInstance()->GetUser()->id;
		$address = (new Universe)->CreateNewAddress("user:$uid");

		MySql::Query("INSERT INTO `user_addresses`(`address`, `user_id`) VALUES('$address', '$uid');");
		HTTP::SendJsonResponse($address);
	}
}