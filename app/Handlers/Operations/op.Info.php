<?php

namespace App\Handlers\Operations;

use Iridium\Core\{Http\HTTP, Dispatcher\Operation};
use Iridium\Modules\Cryptocurrency\Cryptocurrency;
use App\Restrictions\LoginRestriction;


final class InfoOperation extends Operation
{
	protected function Prepare()
	{
		parent::Prepare();
		$this->Require(new LoginRestriction);
	}

	protected function Process()
	{
		HTTP::SendJsonResponse((new Cryptocurrency)->GetInfo());
	}
}