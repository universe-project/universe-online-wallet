<?php

namespace App\Handlers\Pages\Part\Wallet;

use App\Classes\WalletPartPage;
use App\Classes\UserSession;
use App\Restrictions\LoginRestriction;
use Iridium\Modules\Lang\Lang;


final class OptionsPage extends WalletPartPage
{
	protected function GetTemplateName(): string
	{
		return 'part/page.options.tpl';
	}

	protected function Prepare()
	{
		parent::Prepare();

		$this->Require(new LoginRestriction);
		$this->SetTitle('Universe Wallet - ' . Lang::GetDictionary()->FindPhrase('options.title'));

		$userOptions = UserSession::GetInstance()->GetUser()->GetOptions();

		$this->AddData([
			'changeAddr' => $userOptions->changeAddress,
			'timeoutId'  => $userOptions->GetLockTimeoutId()
		]);

		$this->Assign([
			'password_regex'     => PASSWORD_REGEX,
			'email_regex'        => EMAIL_REGEX,
			'pin_regex'          => PIN_REGEX,
			'email'              => UserSession::GetInstance()->GetUser()->email,
			'activation_enabled' => $GLOBALS['config']['user']['email_activation'],
			'pin'                => $userOptions->pin
		]);
	}
}