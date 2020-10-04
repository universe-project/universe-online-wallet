<?php

namespace App\Handlers\Pages\Part\Wallet;

use App\Classes\WalletPartPage;
use App\Restrictions\LoginRestriction;
use Iridium\Modules\Lang\Lang;


/**
 * Частичная страница списка адресов.
 * @package App\Handlers\Pages\Part\Wallet
 */
final class AddressesPage extends WalletPartPage
{
	protected function GetTemplateName(): string
	{
		return 'part/page.addresses.tpl';
	}

	protected function Prepare()
	{
		parent::Prepare();
		$this->Require(new LoginRestriction);
		$this->SetTitle('Universe Wallet - ' . Lang::GetDictionary()->FindPhrase('addr.header'));
		$this->AddData(['addressRegex' => UNI_ADDR_REGEX]);
	}
}