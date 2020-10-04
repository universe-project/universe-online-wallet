<?php

namespace App\Handlers\Operations\Wallet\Abook;

use Iridium\Core\{
	Exceptions\OperationException,
	Http\Filter\FilterOption,
	Http\Filter\ValueType,
	Http\HTTP,
	Dispatcher\Operation
};

use Iridium\Modules\{Lang\Lang, MySql\MySql};
use App\Classes\UserSession;
use App\Restrictions\LoginRestriction;


/**
 * Операция удаления адреса из адресной книги.
 * @package App\Handlers\Operations\Wallet\Abook
 */
final class DeleteOperation extends Operation
{
	protected function Prepare()
	{
		parent::Prepare();
		$this->Require(new LoginRestriction);
	}

	protected function Process()
	{
		$addressId = HTTP::GetPost('id', ValueType::UINT, '', FilterOption::REQUIRED);
		$uid       = UserSession::GetInstance()->GetUser()->id;

		if(!(bool)MySql::GetCell("SELECT COUNT(*) FROM `address_book` WHERE `id` = '{$addressId}' AND `user_id` = '{$uid}' LIMIT 1;"))
		{
			throw new OperationException($this, Lang::GetDictionary()->FindPhrase('addr.err.not_exist'));
		}

		MySql::Query("DELETE FROM `address_book` WHERE `id` = '{$addressId}' AND `user_id` = '{$uid}' LIMIT 1;");
		HTTP::SendJsonResponse(0);
	}
}