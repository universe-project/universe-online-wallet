<?php

namespace App\Handlers\Pages\Part\Wallet;

use App\Classes\WalletPartPage;
use Iridium\Modules\Lang\Lang;
use App\Restrictions\LoginRestriction;


/**
 * Страница подтверждения изменения e-mail адреса.
 * @package App\Handlers\Pages\Part\Wallet
 */
final class ChangeEmailPage extends WalletPartPage
{
	protected function GetTemplateName(): string
	{
		return 'part/page.change_email.tpl';
	}

	protected function Prepare()
	{
		parent::Prepare();
		$this->Require(new LoginRestriction);
		$this->SetTitle('Universe Wallet - ' . Lang::GetDictionary()->FindPhrase('options.email.lb'));
	}
}