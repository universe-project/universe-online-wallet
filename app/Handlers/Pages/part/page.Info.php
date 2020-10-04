<?php

namespace App\Handlers\Pages\Part;
use App\Classes\WalletPartPage;
use Iridium\Modules\Lang\Lang;

/**
 * Страница информации.
 * @package App\Handlers\Pages\Part
 */
final class InfoPage extends WalletPartPage
{
	protected function Prepare()
	{
		parent::Prepare();

		$lang = Lang::GetDictionary();

		$this->SetTitle('Universe Wallet - Информация');
		$this->Assign([
			'inf_cnt' => sprintf($lang->FindPhrase('info.help_c'),
				CryptocurrencyFormat($GLOBALS['config']['fee']), $GLOBALS['config']['transactions_sync_time'])
		]);


	}

	protected function GetTemplateName(): string
	{
		return 'part/page.info.tpl';
	}
}