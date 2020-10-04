<?php

namespace App\Handlers\Pages\Part;

use App\Classes\WalletPartPage;
use App\Restrictions\NotLoginRestriction;
use Iridium\Modules\Lang\Lang;


/**
 * Частичная страница авторизации.
 * @package App\Handlers\Pages\Part
 */
final class LoginPage extends WalletPartPage
{
	protected function GetTemplateName(): string
	{
		return 'part/page.login.tpl';
	}

	function Prepare()
	{
		parent::Prepare();
		$this->SetTitle('Universe Wallet - ' . Lang::GetDictionary()->FindPhrase('auth.auth'));
		$this->Require(new NotLoginRestriction);
	}
}