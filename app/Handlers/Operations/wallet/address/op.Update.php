<?php

namespace App\Handlers\Operations\Wallet\Address;

use Iridium\Core\{
	Exceptions\OperationException,
	Http\Filter\FilterOption,
	Http\Filter\ValueType,
	Http\HTTP,
	Dispatcher\Operation
};

use Iridium\Modules\Lang\Lang;
use Iridium\Modules\MySql\MySql;
use App\Classes\UserSession;
use App\Restrictions\{LoginRestriction, NotLockRestriction};


/**
 * Операция редактирования адреса.
 * @package App\Handlers\Operations\Wallet\Address
 */
final class UpdateOperation extends Operation
{
	function Prepare()
	{
		parent::Prepare();
		$this->Require(new LoginRestriction);
		$this->Require(new NotLockRestriction);
	}

	protected function Process()
	{
		$address = HTTP::GetPost('address', ValueType::STRING, '', FilterOption::REQUIRED);
		$hidden  = HTTP::GetPost('hidden', ValueType::BOOL, false);
		$label   = HTTP::GetPost('label', ValueType::STRING, '', FilterOption::MULTIBITE);
		$uid     = UserSession::GetInstance()->GetUser()->id;

		if(!(bool)MySql::GetCell("SELECT COUNT(*) > 0 FROM `user_addresses` WHERE `address` = '{$address}' AND `user_id` = '{$uid}' LIMIT 1;"))
		{
			throw new OperationException($this, Lang::GetDictionary()->FindPhrase('addr.err.not_exist'));
		}

		$hidden = $hidden ? 1 : 0;
		$label  = MySql::EscapeString($label); // Escape

		MySql::Query("UPDATE `user_addresses` SET `hidden` = '{$hidden}', `label` = '{$label}' WHERE `address` = '{$address}' LIMIT 1;");
		HTTP::SendJsonResponse(0);
	}
}