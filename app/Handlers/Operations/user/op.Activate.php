<?php

namespace App\Handlers\Operations\User;

use Iridium\Core\{
	Exceptions\OperationException,
	Http\Filter\FilterOption,
	Http\Filter\ValueType,
	Http\HTTP,
	Dispatcher\Operation
};

use Iridium\Modules\Lang\Lang;
use Iridium\Modules\MySql\MySql;
use App\Restrictions\NotLoginRestriction;


/**
 * Операция активации пользователя по E-mail.
 * @package App\Handlers\Operations\User
 */
final class ActivateOperation extends Operation
{
	protected function Prepare()
	{
		parent::Prepare();
		$this->Require(new NotLoginRestriction);
	}

	protected function Process()
	{
		$lang = Lang::GetDictionary();

		if(!$GLOBALS['config']['user']['email_activation'])
		{
			throw new OperationException($this, $lang->FindPhrase('act.err.disabled'));
		}

		$userId = HTTP::GetPost('uid', ValueType::UINT, 0, FilterOption::STRICT | FilterOption::REQUIRED);
		$key    = HTTP::GetPost('key', ValueType::STRING, '', FilterOption::REQUIRED | FilterOption::STRICT);

		$dbkey = MySql::GetCell("SELECT `secret_key` FROM `user_activation` WHERE `user_id` = '$userId' LIMIT 1;");
		if(empty($dbkey))
		{
			throw new OperationException($this, $lang->FindPhrase('act.err.already'));
		}

		if($key !== $dbkey)
		{
			throw new OperationException($this, $lang->FindPhrase('act.err.key'));
		}

		$registerTime = MySql::GetCell("SELECT UNIX_TIMESTAMP(`register_timestamp`) FROM `users` WHERE `id` = '$userId' LIMIT 1;");
		if(!empty($registerTime))
		{
			if(TIMESTAMP - $registerTime > $GLOBALS['config']['user']['email_activation_timeout'])
			{
				throw new OperationException($this, $lang->FindPhrase('act.err.timeout'));
			}

			MySql::Query("DELETE FROM `user_activation` WHERE `user_id` = '$userId' AND `secret_key` = '$key' LIMIT 1;");
		}

		HTTP::SendJsonResponse(0);
	}
}