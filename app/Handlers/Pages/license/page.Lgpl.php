<?php

namespace App\Handlers\Pages\License;
use App\Classes\WalletFullPage;


/**
 * Страница лицензии LGPL-3.0.
 * @package App\Handlers\Pages\License
 */
final class LgplPage extends WalletFullPage
{
	protected function GetTemplateName(): string
	{
		return 'license/page.lgpl.tpl';
	}

	protected function Prepare()
	{
		parent::Prepare();

		$this->SetTitle('LGPL-3.0 License');
		$this->IncludeCss('styles');
	}
}