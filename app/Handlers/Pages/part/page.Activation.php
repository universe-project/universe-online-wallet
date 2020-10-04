<?php

namespace App\Handlers\Pages\Part;

use App\Classes\WalletPartPage;
use App\Restrictions\NotLoginRestriction;
use Iridium\Modules\Lang\Lang;


/**
 * Частичная страница активации аккаунта.
 * @package App\Handlers\Pages\Part
 */
final class ActivationPage extends WalletPartPage
{
	/**
	 * @return string Template name of the page.
	 */
	protected function GetTemplateName(): string
	{
		return 'part/page.activation.tpl';
	}

	protected function Prepare()
	{
		parent::Prepare();
		$this->Require(new NotLoginRestriction());
		$this->SetTitle('Universe Wallet - ' . Lang::GetDictionary()->FindPhrase('act.header'));
	}
}