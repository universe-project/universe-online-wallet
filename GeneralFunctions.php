<?php

use core\log\Log;
use core\http\HTTP;


// TODO: move to classes

//Возвращает все позиции вхождения подстроки в строку
//Возвращает false, если ни одного вхождения не найдено
function FoundAllSubstrPos($text, $sub)
{
	$arr     = array();
	$lastPos = strpos($text, $sub);

	if($lastPos === false)
	{
		return false;
	}

	do
	{
		$arr[]   = $lastPos;
		$lastPos = strpos($text, $sub, $lastPos + 1);
	} while($lastPos !== false);

	return $arr;
}

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
function exception_handler($exception)
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
	$class = get_class($e);
	$classComponents = explode('\\', $class);
	$data = [];

	$data['debug'] = IsDebug();

	if(IsDebug())
	{
		$data['file'] = $e->getFile();
		$data['line'] = $e->getLine();
		$data['trace'] = $e->getTrace();
		$data['exception_full_class'] = $class;
	}

	$data['exception_class'] = end($classComponents);
	$data['code'] = $e->getCode();
	$data['message'] = $e->getMessage();

	switch($class)
	{
		case 'core\http\filter\InputFilterException':
			$data['specific'] = [
				'value_name' => $e->GetValueName()
			];

			if(IsDebug())
			{
				$data['specific']['type_id'] = $e->GetValueType();
				$data['specific']['input_id'] = $e->GetInputType();
				$data['specific']['filter_options'] = $e->GetFilterOptions();
			}
			break;
		case 'core\exceptions\OperationException':
				$operationClass = get_class($e->GetOperation());
				$classComponents = explode('\\', $operationClass);

				$data['specific'] = [
					'operation_class' => end($classComponents)
				];

				if(IsDebug())
				{
					$data['specific']['operation_full_class'] = $operationClass;
				}
			break;
		case 'core\exceptions\RestrictionException':
			$restrClass = get_class($e->GetRestriction());
			$classComponents = explode('\\', $restrClass);

			$data['specific'] = [
				'restriction_class' => end($classComponents)
			];

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

/**
 * Считает кол-во страниц на основе общего кол-ва записей и кол-ва записей, показываемых на странице
 * @param    int $count   Общее количество записей
 * @param    int $perPage Количество записей на странице
 * @return    int                Количество страниц
 */
function CalculatePagesCount($count, $perPage)
{
	return (int)ceil($count / $perPage);
}

/**
 * Смещает номер страницы в пределах [0; $pages]
 * @param    int $curPage Текущая страница
 * @param    int $pages   Всего страниц
 * @param    int $move    Сторона, в которую нужно сместить (-1 или +1)
 * @return    int                Итоговый номер страницы
 */
function MovePage($curPage, $pages, $move)
{
	//Переходим по страницам
	switch($move)
	{
		case -1:
			$curPage--;
			break;
		case 1:
			$curPage++;
			break;
	}

	//Ограничиваем промежутком [0; $pages]
	$curPage = ClampNumber($curPage, 0, $pages - 1);

	return $curPage;
}

/**
 * Добавляет символ / по краям регулярного выражение, а также указанные флаги
 * @param	string	$expr	Регулярное выражение
 * @param	string	$flags	Флаги регулярного выражения
 * @return	string			Итоговое регулярное выражение
 * @deprecated
 */
function GetValidRegexpr($expr, $flags = '')
{
	return "/$expr/$flags";
}

/**
 * Определяет, начинается ли строка $haystack с подстроки $needle
 * @param	string	$haystack
 * @param	string	$needle
 * @return	bool
 */
function StartsWith($haystack, $needle)
{
	//strrpos вместо strpos для выполнения меньшего числа операций
	return $needle === "" || strrpos($haystack, $needle, -strlen($haystack)) !== false;
}

/**
 * Определяет, заканчивается ли строка $haystack подстрокой $needle
 * @param	string	$haystack
 * @param	string	$needle
 * @return	bool
 */
function EndsWith($haystack, $needle)
{
	return $needle === "" || (($temp = strlen($haystack) - strlen($needle)) >= 0 && strpos($haystack, $needle, $temp) !== false);
}

/**
 * Ограничивает число заданным промежутком
 * @param	int	$number	Число
 * @param	int	$min	Минимум промежутка
 * @param	int	$max	Максимум промежутка
 * @return	int
 */
function ClampNumber($number, $min, $max)
{
	return max(min($number, $max), $min);
}

/**
 * Проверяет содержит-ли строка беззнаковое целое число
 * @param	string	$str	Строка, которую нужно проверить
 * @returns	bool			true, если строка содержит беззнаковое целое
 * @deprecated
 */
function StringContainsUint($str)
{
	return (string)abs((int)$str) === $str;
}

/**
 * Возвращает размер данных в байтах
 * @param	string	$strSize	Строковое представление размера данных вида 2М, 5G и т. п.
 * @return	int
 */
function GetSizeBytes($strSize)
{
	switch(substr($strSize, -1))
	{
		case 'K':
		case 'k':
			return (int)$strSize * 1024;
		case 'M':
		case 'm':
			return (int)$strSize * 1048576;
		case 'G':
		case 'g':
			return (int)$strSize * 1073741824;
		default:
			return (int)$strSize;
	}
}

/**
 * Извлекает из имени файла его расширение в нижнем регистре
 * @param	string	$fileName	Имя файла
 * @return	string				Расширение файла
 */
function GetFileExtension($fileName)
{
	return strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
}

/**
 * Проверяет соответствует-ли изображение заданному соотношению сторон
 * @param	string	$imagePath		Путь к изображению
 * @param	int		$aspRatWidth	Соотношение по X
 * @param	int		$aspRatHeight	Соотношение по Y
 * @return	bool
 * @deprecated
 */
function MatchAspectRatio($imagePath, $aspRatWidth, $aspRatHeight)
{
	//Получаем размер изображения
	$size = getimagesize($imagePath);

	//Если файл не изображение
	if($size === false)
	{
		return false;
	}

	//Получаем высоту и ширину картинки, проверяем соотношение сторон и возвращаем результат
	list($width, $height) = $size;

//	return ($width % $aspRatWidth === 0) && ($height % $aspRatHeight === 0);
	return $width / $height === $aspRatWidth / $aspRatHeight;
}

function MachineTimeFormat(int $timestamp)
{
	return date('c', $timestamp);
}

function HumanTimeFormat($timestamp)
{
	return date(TIME_FORMAT, $timestamp);
}

function MatchPattern(string $pattern, string $text) : bool
{
	return preg_match("/$pattern/", $text) === 1;
}

/**
 * Generates random cryptographically secure token in the string hex format.
 * @param int $length Langth of the token.
 * @return string Token in string format.
 * @throws Exception If length lower than 2.
 */
function RandomToken(int $length) : string
{
	if($length < 2)
	{
		throw new InvalidArgumentException('Length should be greater or equal 2.');
	}

	return substr(bin2hex(random_bytes(ceil($length / 2))), 0, (int)$length);
}

function DataOrNull($data)
{
	return empty($data) ? 'NULL' : "'$data'";
}

function CryptocurrencyFormat(float $number) : string
{
	return number_format($number, 8);
}