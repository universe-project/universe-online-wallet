<?php

namespace App\Handlers\Pages\License;
use App\Classes\WalletFullPage;


/**
 * Страница лицензии GPL-3.0.
 * @package App\Handlers\Pages\License
 */
final class GplPage extends WalletFullPage
{
	protected function GetTemplateName(): string
	{
		return 'license/page.gpl.tpl';
	}

	protected function Prepare()
	{
		parent::Prepare();

		$this->SetTitle('GPL-3.0 License');
		$this->IncludeCss('styles');
	}
}