#!/usr/bin/env php
<?php

ini_set('display_errors', 1);
error_reporting(E_ALL);

// CLI only
if(PHP_SAPI !== 'cli') { die(-1); }

require 'iridium/cli.inc.php';
require 'app/constants.php';
require 'app/tools.php';

use Iridium\Core\Log\Log;
use Iridium\Core\Module\ModulesManager;
use Iridium\Core\Route\RouteBuilder;
use Iridium\Core\Dispatcher\{RequestDispatcher, RequestType};

$modulesList = include(ROOT_PATH . DIRECTORY_SEPARATOR . 'config/modules.php');

if(!empty($modulesList))
{
	$modulesManager = new ModulesManager(
		(new RouteBuilder)
			->SetPathPrefix('iridium')
			->SetNamespacePrefix('Iridium')
			->SetRawRoutePrefix('Modules')
	);

	$modulesManager->SetConfigsPath(ROOT_PATH . DIRECTORY_SEPARATOR . 'config/modules');
	$modulesManager->LoadModules($modulesList);
}

require 'app/Classes/Universe.php';

// Captcha classes
require 'app/Classes/Captcha/Salt.php';
require 'app/Classes/Captcha/SaltPool.php';

$config = @include(ROOT_PATH . DIRECTORY_SEPARATOR . 'config/config.php');
if($config === false)
{
	throw new Exception('No config file!');
}
$GLOBALS['config'] = $config;

if(isset($argv[1]))
{
	$queryDispatcher = new RequestDispatcher;
	$queryDispatcher->RegisterRequestType(
		(new RequestType('com'))
			->SetPathPrefix('app')
			->SetNamespacePrefix('App')
			->SetClassSuffix('Command')
			->SetFilePrefix('com.')
			->SetRawRoutePrefix('Handlers.Commands')
	);
	$queryDispatcher->Dispatch('com', $argv[1], array_slice($argv, 2));
}
else
{
	// TODO: write help
	echo 'TODO: help' . PHP_EOL;
}

Log::Save();