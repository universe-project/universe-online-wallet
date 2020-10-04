<?php

namespace App\Classes;

use Iridium\Core\Http\HTTP;
use Iridium\Core\Session;


final class UserSession
{
	private static $instance;

	private function __construct() { }

	public static function GetInstance() : self
	{
		if(empty(self::$instance))
		{
			self::$instance = new self;
		}

		return self::$instance;
	}

	public function Restore()
	{
		if(!Session::UserHasSessionId())
		{
			return;
		}

		$session = Session::Create();

		if(!$session->HasData('user'))
		{
			Session::Destroy();
			//throw new \Exception('Cannot restore session. Session created without login. Wrong session will be destroyed.');
			HTTP::Redirect('index.php');
			exit();
		}

		if($GLOBALS['config']['user']['unauthorize_on']['change_ip'] && Session::GetInstance()->GetSessionIP() !== $_SERVER['REMOTE_ADDR'])
		{
			Session::Destroy();
			HTTP::Redirect('index.php');
		}

		if($GLOBALS['config']['user']['unauthorize_on']['change_user_agent'] && Session::GetInstance()->GetSessionUserAgent() !== $_SERVER['HTTP_USER_AGENT'])
		{
			Session::Destroy();
			HTTP::Redirect('index.php');
		}
	}

	public function Login(User $user)
	{
		if($this->IsLoggedIn())
		{
			throw new \Exception('Already logged in.');
		}

		Session::Create()->SetData('user', $user);
	}

	public function GetUser(): User
	{
		return $this->IsLoggedIn() ? Session::GetInstance()->GetData('user') : null;
	}

	public function Exit()
	{
		Session::Destroy();
	}

	public function IsLoggedIn(): bool
	{
		return Session::IsCreated() && Session::GetInstance()->HasData('user');
	}

	public function SetWalletLock(bool $lock)
	{
		if(Session::IsCreated())
		{
			Session::GetInstance()->SetData('lock', $lock);
		}
	}

	public function IsWalletLock(): bool
	{
		return Session::IsCreated() && Session::GetInstance()->HasData('lock') && Session::GetInstance()->GetData('lock');
	}
}