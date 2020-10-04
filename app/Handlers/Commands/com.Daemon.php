<?php

namespace App\Handlers\Commands;

use Iridium\Core\{
	Log\Log,
	Dispatcher\Handler,
	Route\RouteBuilder
};

use Iridium\Modules\Daemon\Daemon;

/**
 * Команда управления демонами.
 * @package App\Handlers\Commands
 */
final class DaemonCommand extends Handler
{
	protected function Process()
	{
		$data = $this->GetQueryData();

		if(isset($data[0]))
		{
			$name = $data[0];
		}
		else
		{
			throw new \Exception("Name of the daemon is required.");
		}

		if(isset($data[1]))
		{
			$command = $data[1];
		}
		else
		{
			throw new \Exception("Command is required.");
		}

		$routeBuilder = (new RouteBuilder)
			->SetPathPrefix('app')
			->SetNamespacePrefix('App')
			->SetClassSuffix('Daemon')
			->SetFilePrefix('daemon.')
			->SetRawRoutePrefix('Daemons');

		$routeData = $routeBuilder->Build($name);

		if(!file_exists($routeData->filePath))
		{
			throw new \Exception("File of the daemon '$name' was not found.");
		}

		/** @noinspection PhpIncludeInspection */
		include_once $routeData->filePath;

		if(!class_exists($routeData->fullClass))
		{
			throw new \Exception("Class of the daemon '$name' was not found.");
		}

		if(!is_subclass_of($routeData->fullClass, Daemon::class))
		{
			throw new \Exception("Class of the daemon '$name' must extends class Daemon.");
		}

		$daemon = new $routeData->fullClass;

		Log::Init($name . '_');

		switch($command)
		{
			case 'start':
				echo $daemon->Start() . PHP_EOL;
				break;
			case 'stop':
				$daemon->Stop();
				break;
			case 'restart':
				$daemon->Restart();
				break;
			case 'kill':
				$daemon->Kill();
				break;
			case 'status':
				echo ($daemon->IsRunning() ? 'active' : 'inactive') . PHP_EOL;
				break;
		}
	}
}