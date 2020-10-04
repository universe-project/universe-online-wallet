<?php

namespace App\Handlers\Pages\Part;

use App\Classes\WalletPartPage;
use App\Restrictions\NotLoginRestriction;
use Iridium\Modules\Lang\Lang;


/**
 * Страница отправки запроса на изменение пароля.
 * @package App\Handlers\Pages\Part
 */
final class ResetPasswordRequestPage extends WalletPartPage
{
	protected function Prepare()
	{
		parent::Prepare();
		$this->Require(new NotLoginRestriction());
		$this->SetTitle('Universe Wallet - ' . Lang::GetDictionary()->FindPhrase('lost_pwd.change'));
		$this->Assign([
			'email_regex' => EMAIL_REGEX,
			'enabled'     => $GLOBALS['config']['user']['password_reset']
		]);
	}

	protected function GetTemplateName(): string
	{
		return 'part/page.reset_pass_request.tpl';
	}
}