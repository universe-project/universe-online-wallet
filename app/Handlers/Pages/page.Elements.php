<?php

namespace App\Handlers\Pages;
use App\Classes\WalletFullPage;


final class ElementsPage extends WalletFullPage
{
	/**
	 * @return string Template name of the page.
	 */
	protected function GetTemplateName(): string
	{
		return 'page.elements.tpl';
	}

	protected function Prepare()
	{
		parent::Prepare();
		$this->SetTitle('Universe Wallet - Elements');
		$this->IncludeJs('script');
		$this->IncludeCss('styles');
	}
}