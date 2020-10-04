<?php

namespace App\Handlers\Operations\User;

use Iridium\Core\{Http\HTTP, Dispatcher\Operation};
use App\Classes\UserSession;
use App\Restrictions\LoginRestriction;


final class ExitOperation extends Operation
{
	protected function Prepare()
	{
		parent::Prepare();
		$this->Require(new LoginRestriction);
	}

	protected function Process()
	{
		UserSession::GetInstance()->Exit();
		HTTP::SendJsonResponse(0);
	}
}