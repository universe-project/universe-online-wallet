<?php

namespace App\Handlers\Pages\Part;

use Iridium\Modules\Lang\Lang;
use App\Classes\WalletPartPage;
use App\Restrictions\NotLoginRestriction;


/**
 * Страница изменения пароля.
 * @package App\Handlers\Pages\Part
 */
final class ResetPasswordPage extends WalletPartPage
{
	protected function Prepare()
	{
		parent::Prepare();
		$this->Require(new NotLoginRestriction);
		$this->SetTitle('Universe Wallet - ' . Lang::GetDictionary()->FindPhrase('lost_pwd.change'));
		$this->Assign(['password_regex' => PASSWORD_REGEX]);
	}

	protected function GetTemplateName(): string
	{
		return 'part/page.reset_pass.tpl';
	}
}