<?php

namespace App\Classes;
use Iridium\Modules\{Lang\Lang, Page\AjaxPartPage};


/**
 * Частичная страница кошелька.
 * Была добавлена для использования совместно с языковым модулем.
 * В последствии может быть удалена, если будет произведён рефакторинг модуля Page в Iridium Core.
 * @package App\Classes
 */
abstract class WalletPartPage extends AjaxPartPage
{
	protected function Preprocess()
	{
		parent::Preprocess();
		$this->Assign(['lang' => Lang::GetDictionary()->ToArray()]);
	}
}