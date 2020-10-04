<?php

namespace App\Handlers\Operations\User;

use Iridium\Core\{
	EmailLetter,
	Exceptions\OperationException,
	Http\Filter\FilterOption,
	Http\Filter\ValueType,
	Http\HTTP,
	Dispatcher\Operation
};

use Iridium\Modules\
{Lang\Lang, MySql\MySql, Cryptocurrency\Cryptocurrency};

use App\Classes\User;
use App\Restrictions\{CaptchaRestriction, NotLoginRestriction};


/**
 * Операция регистрации нового пользователя.
 * @package App\Handlers\Operations\User
 */
final class RegisterOperation extends Operation
{
	protected function Prepare()
	{
		parent::Prepare();
		$this->Require(new NotLoginRestriction);
		$this->Require(new CaptchaRestriction);
	}

	protected function Process()
	{
		$email          = HTTP::GetPost('email', ValueType::STRING, '', FilterOption::REQUIRED);
		$password       = HTTP::GetPost('password', ValueType::STRING, '', FilterOption::REQUIRED | FilterOption::MULTIBITE);
		$repeatPassword = HTTP::GetPost('repeat_password', ValueType::STRING, '', FilterOption::REQUIRED | FilterOption::MULTIBITE);

		$lang = Lang::GetDictionary();

		if(!MatchPattern(EMAIL_REGEX, $email))
		{
			throw new OperationException($this, $lang->FindPhrase('user.err.invalid_email'));
		}

		if(!MatchPattern(PASSWORD_REGEX, $password))
		{
			throw new OperationException($this, $lang->FindPhrase('user.err.invalid_pass'));
		}

		if($password !== $repeatPassword)
		{
			throw new OperationException($this, $lang->FindPhrase('user.err.pwd_match'));
		}

		// Проверяем занят ли e-mail адрес
		if((bool)MySql::GetCell("SELECT COUNT(*) > 0 FROM `users` WHERE `email` = '$email' LIMIT 1;"))
		{
			throw new OperationException($this, $lang->FindPhrase('user.err.email_taken'));
		}

		// Регистрация только по приглашениям
		if($GLOBALS['config']['user']['register_invites'])
		{
			if(!(bool)MySql::GetCell("SELECT COUNT(*) > 0 FROM `register_invites` WHERE `email` = '{$email}' LIMIT 1;"))
			{
				throw new OperationException($this, $lang->FindPhrase('reg.err.invite'));
			}

			// Удаляем использованное приглашение
			MySql::Query("DELETE FROM `register_invites` WHERE `email` = '{$email}' LIMIT 1;");
		}

		$hash = User::CreatePasswordHash($password);

		MySql::Query("INSERT INTO `users`(`email`, `pass_hash`) VALUES('$email', '$hash');");
		$userId = MySql::LastId();

		if($GLOBALS['config']['user']['autocreate_address'])
		{
			$uniNode = new Cryptocurrency();
			$address = $uniNode->CreateNewAddress("user:$userId");
			MySql::Query("INSERT INTO `user_addresses`(`address`, `user_id`) VALUES('$address', '$userId');");
		}

		// User activation
		if($GLOBALS['config']['user']['email_activation'])
		{
			$activationToken = RandomToken(32);
			$link            = HTTP::GetHost() . "/#part=activation&uid={$userId}&key={$activationToken}";

			MySql::Query("INSERT INTO `user_activation`(`user_id`, `secret_key`) VALUES('$userId', '$activationToken');");

			// Activation message
			$message = new EmailLetter(sprintf($lang->FindPhrase('reg.success_msg'), $link), 'Universe Online Wallet - ' . $lang->FindPhrase('act.header'));
			$message->AddRecipient($email);
			$message->Send();
		}

		HTTP::SendJsonResponse($GLOBALS['config']['user']['email_activation'] ? 1 : 0);
	}
}