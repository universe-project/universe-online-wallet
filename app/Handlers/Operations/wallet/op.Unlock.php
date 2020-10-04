<?php

namespace App\Handlers\Operations\Wallet;

use Iridium\Core\{
	Exceptions\OperationException,
	Http\Filter\FilterOption,
	Http\Filter\ValueType,
	Http\HTTP,
	Dispatcher\Operation
};

use App\Classes\UserSession;
use App\Restrictions\LoginRestriction;
use Iridium\Modules\Lang\Lang;


/**
 * Операция разблокировки кошелька.
 * @package App\Handlers\Operations\Wallet
 */
final class UnlockOperation extends Operation
{
	protected function Prepare()
	{
		parent::Prepare();
		$this->Require(new LoginRestriction);
	}

	protected function Process()
	{
		$lang = Lang::GetDictionary();
		$pin  = HTTP::GetPost('pin', ValueType::STRING, '');
		$pass = HTTP::GetPost('pass', ValueType::STRING, '', FilterOption::MULTIBITE);
		$user = UserSession::GetInstance()->GetUser();

		if(empty($user->GetOptions()->pin))
		{
			// Разблокировка по паролю
			if(!$user->CheckPassword($pass))
			{
				throw new OperationException($this, $lang->FindPhrase('user.err.wrong_pass'));
			}
		}
		else
		{
			// Разблокировка по PIN
			if($pin !== $user->GetOptions()->pin)
			{
				throw new OperationException($this, $lang->FindPhrase('pin.wrong'));
			}
		}

		UserSession::GetInstance()->SetWalletLock(false);
		HTTP::SendJsonResponse(0);
	}
}