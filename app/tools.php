<?php

use Iridium\Core\Log\Log;
use Iridium\Core\Http\HTTP;
use Iridium\Core\Http\Filter\InputFilterException;
use Iridium\Core\Exceptions\OperationException;
use Iridium\Core\Exceptions\RestrictionException;

/**
 * @return bool True if debug mode is enabled.
 */
function IsDebug() : bool
{
	return defined('DEBUG') && DEBUG;
}

/**
 * @return bool True if ajax request.
 */
function IsAjax() : bool
{
	return defined('AJAX') && AJAX;
}

/**
 * Exceptions handler.
 * @param $exception
 */
function uow_exception_handler($exception)
{
	if(IsAjax())
	{
		HTTP::SendJsonResponse(ErrorToJson($exception));
	}
	else
	{
		if(!IsDebug())
		{
			// Simplify for the debug mode disabled
			$exception = $exception->getMessage();
		}

		echo "<pre>$exception</pre>";
	}

	Log::Save();
}

function ErrorToJson(Throwable $e)
{
	$class           = get_class($e);
	$classComponents = explode('\\', $class);
	$data            = [];

	$data['debug'] = IsDebug();

	if(IsDebug())
	{
		$data['file']                 = $e->getFile();
		$data['line']                 = $e->getLine();
		$data['trace']                = $e->getTrace();
		$data['exception_full_class'] = $class;
	}

	$data['exception_class'] = end($classComponents);
	$data['code']            = $e->getCode();
	$data['message']         = $e->getMessage();

	switch($class)
	{
		case InputFilterException::class:
			$data['specific'] = ['value_name' => $e->GetValueName()];

			if(IsDebug())
			{
				$data['specific']['type_id']        = $e->GetValueType();
				$data['specific']['input_id']       = $e->GetInputType();
				$data['specific']['filter_options'] = $e->GetFilterOptions();
			}
			break;
		case OperationException::class:
			$operationClass  = get_class($e->GetOperation());
			$classComponents = explode('\\', $operationClass);

			$data['specific'] = [
				'operation_class' => end($classComponents)
			];

			if(IsDebug())
			{
				$data['specific']['operation_full_class'] = $operationClass;
			}
			break;
		case RestrictionException::class:
			$restrClass      = get_class($e->GetRestriction());
			$classComponents = explode('\\', $restrClass);

			$data['specific'] = ['restriction_class' => end($classComponents)];

			if(IsDebug())
			{
				$data['specific']['restriction_full_class'] = $restrClass;
			}
			break;
		default:
			break;
	}

	return ['error' => $data];
}

function MachineTimeFormat(int $timestamp)
{
	return date('c', $timestamp);
}

function HumanTimeFormat($timestamp)
{
	return date('d.m.Y H:i:s', $timestamp);
}

function MatchPattern(string $pattern, string $text): bool
{
	return preg_match("/$pattern/", $text) === 1;
}

function RandomToken(int $length): string
{
	if($length < 2)
	{
		throw new InvalidArgumentException('Argument "length" should be greater or equal 2.');
	}

	return substr(bin2hex(random_bytes(ceil($length / 2))), 0, (int)$length);
}

function DataOrNull($data)
{
	return empty($data) ? 'NULL' : "'$data'";
}

function CryptocurrencyFormat(float $number): string
{
	return number_format($number, 8);
}