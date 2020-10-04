<?php

namespace App\Handlers\Operations\Lang;

use Iridium\Core\Dispatcher\Operation;
use Iridium\Core\Http\HTTP;
use Iridium\Modules\Lang\Dictionary;
use Iridium\Modules\Lang\Lang;


/**
 * Operation for the obtaining list of the languages.
 * @package App\Handlers\Operations\Lang
 */
final class ListOperation extends Operation
{
	protected function Process()
	{
		HTTP::SendJsonResponse(array_map(function($lang)
		{
			/** @var $lang Dictionary */
			return ['code' => $lang->GetCode(), 'name' => $lang->GetName()];
		}, Lang::GetDictionaries()));
	}
}