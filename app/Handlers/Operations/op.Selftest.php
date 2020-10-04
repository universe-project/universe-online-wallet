<?php

namespace App\Handlers\Operations;

include_once 'app/Daemons/daemon.DatabaseCleaner.php';

use Iridium\Core\Exceptions\OperationException;
use Iridium\Core\Http\Filter\FilterOption;
use Iridium\Core\Http\Filter\ValueType;
use Iridium\Core\Http\HTTP;
use Iridium\Core\Dispatcher\Operation;
use App\Daemons\DatabaseCleanerDaemon;
use App\Restrictions\LoginRestriction;

/**
 * Операция самотестирования.
 * @package App\Handlers\Operation
 */
final class SelftestOperation extends Operation
{
	const TOKEN = 'jNmn23MIw02Mw';

	protected function Prepare()
	{
		parent::Prepare();
		$this->Require(new LoginRestriction);
	}

	protected function Process()
	{
		$token = HTTP::GetRequest('token', ValueType::STRING, '', FilterOption::REQUIRED | FilterOption::MULTIBITE);

		if($token !== self::TOKEN)
		{
			throw new OperationException($this, 'Unknown token!');
		}

		$extensions = ['gd', 'mysqli', 'pcntl', 'shmop'];

		$result             = new \stdClass();
		$result->extensions = new \stdClass();

		foreach($extensions as $ext)
		{
			$result->extensions->{$ext} = extension_loaded($ext);
		}

		HTTP::SendJsonResponse($result);

		//HTTP::SendJsonResponse((new DatabaseCleanerDaemon())->IsRunning());
	}
}