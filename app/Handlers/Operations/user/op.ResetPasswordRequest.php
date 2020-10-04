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

use Iridium\Modules\Lang\Lang;
use Iridium\Modules\MySql\MySql;
use App\Restrictions\{CaptchaRestriction, NotLoginRestriction};


/**
 * Операция отправки заявки на изменение пароля.
 * @package App\Handlers\Operations\User
 */
final class ResetPasswordRequestOperation extends Operation
{
	protected function Prepare()
	{
		parent::Prepare();
		$this->Require(new NotLoginRestriction);
		$this->Require(new CaptchaRestriction);
	}

	protected function Process()
	{
		$lang = Lang::GetDictionary();

		if(!$GLOBALS['config']['user']['password_reset'])
		{
			throw new OperationException($this, $lang->FindPhrase('lost_pwd.disabled'));
		}

		$email = HTTP::GetPost('email', ValueType::STRING, '', FilterOption::REQUIRED);
		$userId = MySql::GetCell("SELECT `id` FROM `users` WHERE `email` = '{$email}' LIMIT 1;");

		// TODO: блокировать пользователя по IP, если отправляется слишком много запросов на восстановление пароля

		if(empty($userId)) { throw new OperationException($this, $lang->FindPhrase('user.err.email')); }

		$notActive = (bool)MySql::GetCell("SELECT COUNT(*) > 0 FROM `user_activation` WHERE `user_id` = '$userId' LIMIT 1;");
		if($notActive) { throw new OperationException($this, $lang->FindPhrase('user.err.activate')); }

		$exists = (bool)MySql::GetCell("SELECT COUNT(*) > 0 FROM `reset_pass_requests` WHERE `user_id` = '{$userId}' LIMIT 1;");
		if($exists) { throw new OperationException($this, $lang->FindPhrase('lost_pwd.req.already')); }

		$skey = RandomToken(32);
		MySql::Query("INSERT INTO `reset_pass_requests`(`user_id`, `secret_key`) VALUES('{$userId}', '{$skey}');");
		$link = HTTP::GetHost() . "#part=resetPass&uid={$userId}&key={$skey}";

		// Сообщение с ссылкой на страницу восстановления пароля
		$message = new EmailLetter(sprintf($lang->FindPhrase('lost_pwd.req.msg'), $link), 'Universe Online Wallet - ' . $lang->FindPhrase('lost_pwd.change'));
		$message->AddRecipient($email);
		$message->Send();

		HTTP::SendJsonResponse(0);
	}
}