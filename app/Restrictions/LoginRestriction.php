<?php

namespace App\Restrictions;

use Iridium\Core\Restriction\Restriction;
use App\Classes\UserSession;


final class LoginRestriction extends Restriction
{
	public function Check() : bool
	{
		return UserSession::GetInstance()->IsLoggedIn();
	}

	public function GetFailedCheckMessage() : string
	{
		return 'Требуется авторизация.';
	}

	public function GetCode() : string
	{
		return '';
	}
}