<?php

namespace App\Handlers\Operations\Wallet\Abook;

use Iridium\Core\{Http\HTTP, Dispatcher\Operation};
use Iridium\Modules\MySql\MySql;
use App\Classes\UserSession;
use App\Restrictions\LoginRestriction;


/**
 * Операция получения списка адресов адресной книги.
 * @package App\Handlers\Operations\Wallet\Abook
 */
final class ListOperation extends Operation
{
	function Prepare()
	{
		parent::Prepare();
		$this->Require(new LoginRestriction);
	}

	protected function Process()
	{
		$uid       = UserSession::GetInstance()->GetUser()->id;
		$addresses = MySql::GetRows("SELECT `id`, `address`, `label` FROM `address_book` WHERE `user_id` = '{$uid}';");
		HTTP::SendJsonResponse($addresses);
	}
}