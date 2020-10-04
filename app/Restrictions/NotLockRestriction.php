<?php

namespace App\Restrictions;

use Iridium\Core\Restriction\Restriction;
use App\Classes\UserSession;


final class NotLockRestriction extends Restriction
{
	public function Check() : bool
	{
		return !UserSession::GetInstance()->IsWalletLock();
	}

	public function GetFailedCheckMessage() : string
	{
		return 'Кошелёк заблокирован.';
	}

	public function GetCode() : string
	{
		return 'lock_restr';
	}
}