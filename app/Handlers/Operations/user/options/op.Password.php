<?php

namespace App\Handlers\Operations\User\Options;

use Iridium\Core\{
	Exceptions\OperationException,
	Http\Filter\FilterOption,
	Http\Filter\ValueType,
	Http\HTTP,
	Log\Log,
	Dispatcher\Operation
};

use App\Classes\UserSession;
use App\Restrictions\{LoginRestriction, NotLockRestriction};
use Iridium\Modules\Lang\Lang;


/**
 * Операция изменения пароля.
 * @package App\Handlers\Operations\User\Options
 */
final class PasswordOperation extends Operation
{
	protected function Prepare()
	{
		parent::Prepare();
		$this->Require(new LoginRestriction);
		$this->Require(new NotLockRestriction);
	}

	/**
	 * @throws OperationException
	 * @throws \Iridium\Core\Http\Filter\InputFilterException
	 * @throws \Exception
	 */
	protected function Process()
	{
		$lang   = Lang::GetDictionary();
		$pass   = HTTP::GetPost('pass', ValueType::STRING, '', FilterOption::REQUIRED | FilterOption::MULTIBITE);
		$repeat = HTTP::GetPost('repeat_pass', ValueType::STRING, '', FilterOption::REQUIRED | FilterOption::MULTIBITE);
		$old    = HTTP::GetPost('old_pass', ValueType::STRING, '', FilterOption::REQUIRED | FilterOption::MULTIBITE);
		$user   = UserSession::GetInstance()->GetUser();

		if(!$user->CheckPassword($old))
		{
			throw new OperationException($this, $lang->FindPhrase('options.pass.err.wrong_cur'));
		}

		if($pass !== $repeat)
		{
			throw new OperationException($this, $lang->FindPhrase('user.err.pwd_match'));
		}

		if(!MatchPattern(PASSWORD_REGEX, $pass))
		{
			throw new OperationException($this, $lang->FindPhrase('user.err.invalid_pass'));
		}

		Log::Event("Пользователь с id {$user->id} изменил пароль.");

		$user->ChangePassword($pass);
		HTTP::SendJsonResponse(0);
	}
}