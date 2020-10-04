<?php

namespace App\Handlers\Operations\User\Options;

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
use App\Restrictions\LoginRestriction;


/**
 * Операция подтверждения изменения e-mail адреса пользователя.
 * @package App\Handlers\Operations\User\Options
 */
final class EmailSubmitOperation extends Operation
{
	protected function Prepare()
	{
		parent::Prepare();
		$this->Require(new LoginRestriction);
	}

	protected function Process()
	{
		$lang = Lang::GetDictionary();
		$key  = HTTP::GetPost('key', ValueType::STRING, '', FilterOption::REQUIRED);
		$uid  = HTTP::GetPost('uid', ValueType::UINT, 0, FilterOption::REQUIRED | FilterOption::STRICT);
		$user = UserSession::GetInstance()->GetUser();

		if($uid !== $user->id)
		{
			throw new OperationException($this, $lang->FindPhrase('options.email.err.not_yours'));
		}

		$data = MySql::GetRow("SELECT `new_email`, `secret_key`, UNIX_TIMESTAMP(`timestamp`) as `ts` FROM `change_email_requests` WHERE `user_id` = '{$uid}' LIMIT 1;");
		if(empty($data))
		{
			throw new OperationException($this, $lang->FindPhrase('options.email.err.no_req'));
		}

		if($data['secret_key'] !== $key)
		{
			throw new OperationException($this, $lang->FindPhrase('options.email.err.link_error'));
		}

		if(TIMESTAMP - $data['ts'] > $GLOBALS['config']['user']['email_activation_timeout'])
		{
			throw new OperationException($this, $lang->FindPhrase('options.email.err.timeout'));
		}

		MySql::Query("DELETE FROM `change_email_requests` WHERE `user_id` = '{$uid}';");

		$user->ChangeEmail($data['new_email']);
		HTTP::SendJsonResponse(0);
	}
}