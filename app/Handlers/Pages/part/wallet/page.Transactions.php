<?php

namespace App\Handlers\Pages\Part\Wallet;

use App\Classes\WalletPartPage;
use App\Restrictions\LoginRestriction;
use Iridium\Modules\Lang\Lang;


/**
 * Частичная страница списка транзакций.
 * @package App\Handlers\Pages\Part\Wallet
 */
final class TransactionsPage extends WalletPartPage
{
	protected function GetTemplateName(): string
	{
		return 'part/page.transactions.tpl';
	}

	protected function Prepare()
	{
		parent::Prepare();
		$this->SetTitle('Universe Wallet - ' . Lang::GetDictionary()->FindPhrase('trans.title'));
		$this->Require(new LoginRestriction);
	}
}