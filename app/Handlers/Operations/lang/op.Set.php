<?php

namespace App\Handlers\Operations\Lang;

use Iridium\Core\Dispatcher\Operation;
use Iridium\Core\Exceptions\OperationException;
use Iridium\Core\Http\Filter\FilterOption;
use Iridium\Core\Http\Filter\ValueType;
use Iridium\Core\Http\HTTP;
use Iridium\Modules\Lang\Lang;


/**
 * Language setting operation.
 * @package App\Handlers\Operations\Lang
 */
final class SetOperation extends Operation
{
	protected function Process()
	{
		$code = HTTP::GetPost('code', ValueType::STRING, '', FilterOption::REQUIRED);

		try
		{
			Lang::SetActive($code);
		}
		catch(\Throwable $e)
		{
			throw new OperationException($this, Lang::GetDictionary()->FindPhrase('lang.err.code'));
		}

		HTTP::SendJsonResponse(0);
	}
}