<?php

namespace App\Handlers\Pages\License;
use App\Classes\WalletFullPage;


/**
 * Страница лицензии MIT.
 * @package App\Handlers\Pages\License
 */
final class MitPage extends WalletFullPage
{
	protected function GetTemplateName(): string
	{
		return 'license/page.mit.tpl';
	}

	protected function Prepare()
	{
		parent::Prepare();

		$this->SetTitle('MIT License');
		$this->IncludeCss('styles');
	}
}