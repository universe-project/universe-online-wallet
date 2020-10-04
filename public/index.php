<?php
/**
 * Index file.
 * @author rayleigh <rayleigh@protonmail.com>
 * @copyright 2017 Universe Coin.
 */

/**
 * Debug mode.
 * @see IsDebug
 */
define('DEBUG', true);

// TODO: to parameters
ini_set('display_errors', 1);
error_reporting(E_ALL);

require '../iridium/web.inc.php';
require_once '../iridium/Core/EmailLetter.php';
require '../app/constants.php';
require '../app/tools.php';

require '../config/config.php';
require '../config/php_params.php';

// Defined in tools.php
set_exception_handler('uow_exception_handler');

// Restrictions
require '../app/Restrictions/LoginRestriction.php';
require '../app/Restrictions/NotLoginRestriction.php';
require '../app/Restrictions/NotLockRestriction.php';
require '../app/Restrictions/CaptchaRestriction.php';

use Iridium\Core\Log\Log;
use Iridium\Core\Http\{HTTP, Filter\ValueType};
use Iridium\Core\Module\ModulesManager;
use Iridium\Core\Route\{RouteBuilder, Route};
use Iridium\Core\Dispatcher\{RequestDispatcher, RequestType};

Log::Init();

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

// Site classes
require '../app/Classes/UserSession.php';
require '../app/Classes/UserOptions.php';
require '../app/Classes/User.php';
require '../app/Classes/Universe.php';
require '../app/Classes/Transaction.php';
require '../app/Classes/WalletFullPage.php';
require '../app/Classes/WalletPartPage.php';

// Captcha classes
require '../app/Classes/Captcha/Salt.php';
require '../app/Classes/Captcha/SaltPool.php';
require '../app/Classes/Captcha/Captcha.php';

$config = @include(ROOT_PATH . DIRECTORY_SEPARATOR . 'config/config.php');
if($config === false)
{
	throw new Exception('No config file!');
}
$GLOBALS['config'] = $config;

// Восстанавливаем сессию, если пользователь ранее выполнил вход
\App\Classes\UserSession::GetInstance()->Restore();

/**
 * @var $opReqType RequestType Operation request type.
 */
$opReqType = (new RequestType('op'))
	->SetPathPrefix('app')
	->SetNamespacePrefix('App')
	->SetClassSuffix('Operation')
	->SetFilePrefix('op.')
	->SetRawRoutePrefix('Handlers.Operations');

/**
 * @var $pageReqType RequestType Page request type.
 */
$pageReqType = $opReqType->Clone('page')
	->SetClassSuffix('Page')
	->SetFilePrefix('page.')
	->SetRawRoutePrefix('Handlers.Pages')
	->SetBeforeDispatch(function(Route $routeData)
	{
		if(in_array('part', $routeData->pathComponents, true))
		{
			define('AJAX', true);
		}
	});

$queryDispatcher = new RequestDispatcher;
$queryDispatcher->RegisterRequestType($opReqType);
$queryDispatcher->RegisterRequestType($pageReqType);

if(isset($_GET['op']))
{
	define('AJAX', true);
	$queryDispatcher->Dispatch('op', HTTP::GetGet('op', ValueType::STRING));
}
else
{
	$queryDispatcher->Dispatch('page', HTTP::GetGet('page', ValueType::STRING, 'index'));
}

Log::Save();