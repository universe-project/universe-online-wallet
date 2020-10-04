<?php

namespace App\Handlers\Operations\Wallet;

use Iridium\Core\{Http\HTTP, Dispatcher\Operation};
use App\Classes\UserSession;
use App\Restrictions\LoginRestriction;


/**
 * Операция блокировки кошелька.
 * @package App\Handlers\Operations\Wallet
 */
final class LockOperation extends Operation
{
	protected function Prepare()
	{
		parent::Prepare();
		$this->Require(new LoginRestriction);
	}

	protected function Process()
	{
		UserSession::GetInstance()->SetWalletLock(true);

		// Отправляем:
		// true - если разблокировка по паролю
		// false - если разблокировка по PIN
		HTTP::SendJsonResponse(empty(UserSession::GetInstance()->GetUser()->GetOptions()->pin));
	}
}