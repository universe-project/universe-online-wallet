<?php

namespace App\Handlers\Operations\Wallet\Abook;

use Iridium\Core\{
	Exceptions\OperationException,
	Http\Filter\FilterOption,
	Http\Filter\ValueType,
	Http\HTTP,
	Dispatcher\Operation
};

use Iridium\Modules\{MySql\MySql, Lang\Lang};
use App\Classes\UserSession;
use App\Restrictions\LoginRestriction;


/**
 * Операция добавления адреса в адресную книгу.
 * @package App\Handlers\Operations\Wallet\Abook
 */
final class AddOperation extends Operation
{
	/**
	 * Максимальное кол-во адресов в адресной книге.
	 * TODO: перенести
	 */
	const MAX_NUMBER = 100;

	protected function Prepare()
	{
		parent::Prepare();
		$this->Require(new LoginRestriction);
	}

	protected function Process()
	{
		$lang    = Lang::GetDictionary();
		$address = HTTP::GetPost('address', ValueType::STRING, '', FilterOption::REQUIRED);
		$label   = HTTP::GetPost('label', ValueType::STRING, '', FilterOption::MULTIBITE);
		$label   = MySql::EscapeString($label);
		$uid     = UserSession::GetInstance()->GetUser()->id;

		if(!MatchPattern(UNI_ADDR_REGEX, $address))
		{
			throw new OperationException($this, $lang->FindPhrase('addr.err.wrong'));
		}

		if((bool)MySql::GetCell("SELECT COUNT(*) > 0 FROM `address_book` WHERE `user_id` = '{$uid}' AND `address` = '$address' LIMIT 1;"))
		{
			throw new OperationException($this, $lang->FindPhrase('addr.err.already'));
		}

		if(MySql::GetCell("SELECT COUNT(*) FROM `address_book` WHERE `user_id` = '{$uid}';") >= self::MAX_NUMBER)
		{
			throw new OperationException($this, sprintf($lang->FindPhrase('addr.err.limit'), self::MAX_NUMBER));
		}

		MySql::Query("INSERT INTO `address_book`(`address`, `user_id`, `label`) VALUES('{$address}', '{$uid}', '{$label}')");
		HTTP::SendJsonResponse(0);
	}
}