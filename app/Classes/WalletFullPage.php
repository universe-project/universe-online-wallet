<?php

namespace App\Classes;
use Iridium\Modules\{Lang\Lang, Page\FullPage};


/**
 * Полная страница кошелька.
 * Была добавлена для использования совместно с языковым модулем.
 * В последствии может быть удалена, если будет произведён рефакторинг модуля Page в Iridium Core.
 * @package App\Classes
 */
abstract class WalletFullPage extends FullPage
{
	protected function Preprocess()
	{
		parent::Preprocess();
		$lang = Lang::GetDictionary();
		$this->Assign(['lang' => $lang->ToArray()]);
		$this->AssignToStruct(['lang' => $lang->GetCode()]);
	}
}