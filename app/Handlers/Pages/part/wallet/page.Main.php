<?php

namespace App\Handlers\Pages\Part\Wallet;

use App\Classes\WalletPartPage;
use App\Restrictions\LoginRestriction;
use Iridium\Modules\Lang\Lang;


/**
 * Главная страница.
 * @package App\Handlers\Pages\Part\Wallet
 */
final class MainPage extends WalletPartPage
{
	/**
	 * @return string Template name of the page.
	 */
	protected function GetTemplateName(): string
	{
		return 'part/page.main.tpl';
	}

	protected function Prepare()
	{
		parent::Prepare();
		$this->SetTitle('Universe Wallet - ' . Lang::GetDictionary()->FindPhrase('main.header'));
		$this->Require(new LoginRestriction);
		$this->AddData(['statsUpdTime' => $GLOBALS['config']['transactions_sync_time']]);
	}
}