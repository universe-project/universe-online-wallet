<?php

namespace App\Handlers\Operations\User;

use Iridium\Core\{
	Exceptions\OperationException,
	Http\Filter\FilterOption,
	Http\Filter\ValueType,
	Http\HTTP,
	Log\Log,
	Dispatcher\Operation
};

use Iridium\Modules\MySql\MySql;
use App\Classes\User;
use App\Restrictions\NotLoginRestriction;


/**
 * Операция изменения пароля.
 * @package App\Handlers\Operations\User
 */
final class ResetPasswordOperation extends Operation
{
	protected function Prepare()
	{
		parent::Prepare();
		$this->Require(new NotLoginRestriction);
	}

	protected function Process()
	{
		$lang = Lang::GetDictionary();

		if(!$GLOBALS['config']['user']['password_reset'])
		{
			throw new OperationException($this, $lang->FindPhrase('lost_pwd.disabled'));
		}

		$userId = HTTP::GetPost('uid', ValueType::UINT, 0, FilterOption::STRICT | FilterOption::REQUIRED);
		$key    = HTTP::GetPost('key', ValueType::STRING, '', FilterOption::REQUIRED | FilterOption::STRICT);
		$pass   = HTTP::GetPost('password', ValueType::STRING, '', FilterOption::REQUIRED | FilterOption::MULTIBITE);
		$repeat = HTTP::GetPost('repeat_password', ValueType::STRING, '', FilterOption::REQUIRED | FilterOption::MULTIBITE);
		$dbkey  = MySql::GetCell("SELECT `secret_key` FROM `reset_pass_requests` WHERE `user_id` = '$userId' LIMIT 1;");

		// Проверяем есть ли запрос
		// Также сразу проверяем существует ли пользователь, ведь несуществующий пользователь не мог подать заявку
		if(empty($dbkey)) { throw new OperationException($this, $lang->FindPhrase('lost_pwd.res.not_valid')); }

		// Проверяем совпадает ли ключ в базе с ключём пользователя
		if($key !== $dbkey) { throw new OperationException($this, $lang->FindPhrase('lost_pwd.res.wrong_key')); }

		// Проверяем совпадают ли пароли
		if($pass !== $repeat) { throw new OperationException($this, $lang->FindPhrase('user.err.pwd_match')); }

		// Проверяем правильность пароля
		if(!MatchPattern(PASSWORD_REGEX, $pass)) { throw new OperationException($this, $lang->FindPhrase('user.err.invalid_pass')); }

		MySql::Query("DELETE FROM `reset_pass_requests` WHERE `user_id` = '$userId' AND `secret_key` = '$key' LIMIT 1;");

		$hash = User::CreatePasswordHash($pass);
		MySql::Query("UPDATE `users` SET `pass_hash` = '{$hash}' WHERE `id` = '{$userId}' LIMIT 1;");
		Log::Event("Пользователь с id {$userId} выполнил изменение пароля.");
		HTTP::SendJsonResponse(0);
	}
}