<?php

namespace App\Restrictions;

use Iridium\Core\Restriction\Restriction;
use App\Classes\UserSession;


final class NotLoginRestriction extends Restriction
{
	public function Check() : bool
	{
		return !UserSession::GetInstance()->IsLoggedIn();
	}

	public function GetFailedCheckMessage() : string
	{
		return 'Вы должны выйти чтобы совершить это действие.';
	}

	public function GetCode() : string
	{
		return '';
	}
}