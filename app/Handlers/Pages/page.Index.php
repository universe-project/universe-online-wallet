<?php

namespace App\Handlers\Pages;

use App\Classes\WalletFullPage;
use App\Classes\UserSession;
use Iridium\Core\Http\Filter\ValueType;
use Iridium\Core\Http\HTTP;
use Iridium\Modules\Lang\Lang;


/**
 * Index page.
 * @package App\Handlers\Pages
 */
final class IndexPage extends WalletFullPage
{
	/**
	 * Name of the language imprint cookie.
	 */
	const COOKIE_IMPRINT = 'lang_imprint';

	protected function GetTemplateName(): string
	{
		return 'page.index.tpl';
	}

	protected function Prepare()
	{
		parent::Prepare();

		$this->SetTitle('Universe Wallet');
		$this->IncludeJs('script', $GLOBALS['config']['version']);
		$this->IncludeCss('styles', $GLOBALS['config']['version']);

		$session = UserSession::GetInstance();

		$this->Assign([
			'version'         => $GLOBALS['config']['version'],
			'iridium_version' => IRIDIUM_VERSION,
			'email'           => $session->IsLoggedIn() ? $session->GetUser()->email : '',
			'main_site_link'  => $GLOBALS['config']['main_site_link']
		]);

		$jsData = [
			'debug'          => IsDebug(),
			'iridiumVersion' => IRIDIUM_VERSION,
			'loggedIn'       => $session->IsLoggedIn(),
			'maxAddresses'   => $GLOBALS['config']['user']['max_addresses'],
			'feeAmount'      => $GLOBALS['config']['fee'],
			'lock'           => $session->IsWalletLock()
		];

		$lang               = Lang::GetDictionary()->Filter('client');
		$langCacheEnabled   = Lang::IsCacheEnabled();
		$langCookieImprint  = HTTP::GetCookie(self::COOKIE_IMPRINT, ValueType::STRING, '');
		$langImprint        = self::GetLangImprint($lang->GetCode(), Lang::GetCacheTimestamp());

		$jsData['lang'] = [
			'imprint'       => $langImprint,
			'imprintCookie' => self::COOKIE_IMPRINT,
			'cache'         => $langCacheEnabled,
			'current'       => $lang->GetCode()
		];

		if(!$langCacheEnabled || $langCookieImprint !== $langImprint)
		{
			$jsData['lang']['data'] = $lang->ToClientFormat();
		}

		if($session->IsLoggedIn())
		{
			$options                   = $session->GetUser()->GetOptions();
			$jsData['hasPin']          = !empty($options->pin);
			$jsData['autolockTimeout'] = $options->autolockTimeout;
		}

		$this->AssignJsData($jsData);
	}

	private static function GetLangImprint(string $code, int $timestamp): string
	{
		return hash('crc32b', $code . $timestamp);
	}
}
