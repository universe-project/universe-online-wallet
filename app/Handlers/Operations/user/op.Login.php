<?php

namespace App\Handlers\Operations\User;

use Iridium\Core\
{
	Exceptions\OperationException,
	Http\Filter\FilterOption,
	Http\Filter\ValueType,
	Http\HTTP,
	Dispatcher\Operation,
	Log\Log,
	Session
};

use Iridium\Modules\Lang\Lang;
use Iridium\Modules\MySql\MySql;
use App\Classes\User;
use App\Classes\UserSession;
use App\Restrictions\NotLoginRestriction;


/**
 * Операция авторизации пользователя.
 * @package App\Handlers\Operations\User
 */
final class LoginOperation extends Operation
{
	function Prepare()
	{
		parent::Prepare();
		$this->Require(new NotLoginRestriction);
	}

	protected function Process()
	{
		$lang     = Lang::GetDictionary();
		$email    = HTTP::GetPost('email', ValueType::STRING, '', FilterOption::REQUIRED | FilterOption::STRICT);
		$password = HTTP::GetPost('password', ValueType::STRING, '', FilterOption::MULTIBITE | FilterOption::REQUIRED | FilterOption::STRICT);
		$userData = MySql::GetRow("SELECT `id`, `pass_hash` FROM `users` WHERE `email` = '$email' LIMIT 1;");

		if(empty($userData) || !User::CheckPasswordHash($password, $userData['pass_hash']))
		{
			throw new OperationException($this, $lang->FindPhrase('auth.wrong_data'));
		}

		if($GLOBALS['config']['user']['email_activation'])
		{
			if((bool)MySql::GetCell("SELECT COUNT(*) > 0 FROM `user_activation` WHERE `user_id` = '{$userData['id']}' LIMIT 1;"))
			{
				throw new OperationException($this, $lang->FindPhrase('user.err.activate'));
			}
		}

		$user = new User($userData['id'], $email, $userData['pass_hash']);
		UserSession::GetInstance()->Login($user);

		$options = $user->GetOptions();
		$session = Session::GetInstance();

		Log::Event("Пользователь {$email} (id {$user->id}) выполнил авторизацию.\nIP: {$session->GetSessionIP()}\nUser Agent: {$session->GetSessionUserAgent()}");

		HTTP::SendJsonResponse([
			'email'           => $email,
			'autolockTimeout' => $options->autolockTimeout,
			'hasPin'          => !empty($options->pin)
		]);
	}
}