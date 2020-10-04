<?php

namespace App\Handlers\Pages\Part;

use App\Classes\WalletPartPage;
use App\Restrictions\NotLoginRestriction;
use Iridium\Modules\Lang\Lang;


/**
 * Частичная страница регистрации.
 * @package App\Handlers\Pages\Part
 */
final class RegisterPage extends WalletPartPage
{
	protected function GetTemplateName(): string
	{
		return 'part/page.register.tpl';
	}

	protected function Prepare()
	{
		parent::Prepare();
		$this->Require(new NotLoginRestriction);
		$this->SetTitle('Universe Wallet - ' . Lang::GetDictionary()->FindPhrase('reg.reg'));
		$this->Assign([
			'email_regex'        => EMAIL_REGEX,
			'password_regex'     => PASSWORD_REGEX,
			'activation_enabled' => $GLOBALS['config']['user']['email_activation'],
			'invites'            => $GLOBALS['config']['user']['register_invites']
		]);
	}
}