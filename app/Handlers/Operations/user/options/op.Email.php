<?php

namespace App\Handlers\Operations\User\Options;

use Iridium\Core\{
	EmailLetter,
	Exceptions\OperationException,
	Http\Filter\FilterOption,
	Http\Filter\ValueType,
	Http\HTTP,
	Dispatcher\Operation
};

use Iridium\Modules\Lang\Lang;
use Iridium\Modules\MySql\MySql;
use App\Classes\{UserSession, User};
use App\Restrictions\{LoginRestriction, NotLockRestriction};


/**
 * Операция изменения e-mail пользователя или, в случае если включена активация по e-mail, создания заявки на изменение e-mail.
 * @package App\Handlers\Operations\User\Options
 */
final class EmailOperation extends Operation
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
		$lang  = Lang::GetDictionary();
		$email = HTTP::GetPost('email', ValueType::STRING, '', FilterOption::REQUIRED);
		$pass  = HTTP::GetPost('pass', ValueType::STRING, '', FilterOption::REQUIRED | FilterOption::MULTIBITE);
		$user  = UserSession::GetInstance()->GetUser();
		$hash  = MySql::GetCell("SELECT `pass_hash` FROM `users` WHERE `id` = '{$user->id}' LIMIT 1;");

		if(empty($hash) || !User::CheckPasswordHash($pass, $hash))
		{
			throw new OperationException($this, $lang->FindPhrase('user.err.wrong_pass'));
		}

		if($user->email === $email)
		{
			throw new OperationException($this, $lang->FindPhrase('options.email.err.match'));
		}

		if(!MatchPattern(EMAIL_REGEX, $email))
		{
			throw new OperationException($this, $lang->FindPhrase('user.err.invalid_email'));
		}

		if((bool)MySql::GetCell("SELECT COUNT(*) > 0 FROM `users` WHERE `email` = '{$email}' LIMIT 1;"))
		{
			throw new OperationException($this, $lang->FindPhrase('user.err.email_taken'));
		}

		if($GLOBALS['config']['user']['email_activation'])
		{
			// Необходимо подтверждение изменение e-mail

			if((bool)MySql::GetCell("SELECT COUNT(*) > 0 FROM `change_email_requests` WHERE `user_id` = '{$user->id}' LIMIT 1;"))
			{
				throw new OperationException($this, $lang->FindPhrase('options.email.err.already'));
			}

			$skey = RandomToken(32);
			MySql::Query("INSERT INTO `change_email_requests`(`user_id`, `new_email`, `secret_key`) VALUES('{$user->id}', '{$email}', '{$skey}');");

			$link = HTTP::GetHost() . "/#part=emailChange&uid={$user->id}&key={$skey}";

			// Сообщение с ссылкой подтверждения
			$message = new EmailLetter(
				sprintf($lang->FindPhrase('options.email.conf.mail'), $link),
				'Universe Online Wallet - ' . $lang->FindPhrase('options.email.err.already')
			);

			$message->AddRecipient($email);
			$message->Send();

			HTTP::SendJsonResponse(0);
		}
		else
		{
			$user->ChangeEmail($email);
			HTTP::SendJsonResponse(1);
		}
	}
}