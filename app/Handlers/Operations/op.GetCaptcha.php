<?php

namespace App\Handlers\Operations;

use Iridium\Core\{Http\HTTP, Dispatcher\Operation};
use App\Classes\Captcha\{Captcha, SaltPool};

/**
 * Операция получения капчи.
 * @package App\Handlers\Operation
 */
final class GetCaptchaOperation extends Operation
{
	/**
	 * Путь к файлу шрифта для капчи.
	 */
	const FONT_PATH = ROOT_PATH . DIRECTORY_SEPARATOR . 'storage/fonts/Play-Regular.ttf';

	/**
	 * Размер шрифта в типографских пунктах.
	 */
	const FONT_SIZE = 24;

	protected function Prepare()
	{
		parent::Prepare();
	}

	protected function Process()
	{
		$conf = (object)$GLOBALS['config']['captcha'];
		$pool = new SaltPool($conf->salt_pool_len, $conf->sm_salt_id, $conf->sm_wlock_id);
		$pool->Load();
		$salt = $pool->GetFirst();
		$code = strval(mt_rand(pow(10, $conf->length - 1), pow(10, $conf->length) - 1));

		$tbs = imagettfbbox(self::FONT_SIZE, 0, self::FONT_PATH, $code);

		$textWidth  = abs($tbs[0] - $tbs[2]);
		$textHeight = abs($tbs[1] - $tbs[5]);

		$im = imagecreate($textWidth, $textHeight);

		// Do not remove variable '$white' because if no white color, picture will be filled with black
		$white = imagecolorallocate($im, 0xFF, 0xFF, 0xFF);
		$black = imagecolorallocate($im, 0x00, 0x00, 0x00);

		imagettftext($im, self::FONT_SIZE, 0, 0, $textHeight - 1, $black, self::FONT_PATH, $code);

		ob_start();
		imagepng($im);
		$data = ob_get_contents();
		ob_end_clean();
		imagedestroy($im);

		HTTP::SendJsonResponse([
			'pic'  => base64_encode($data),
			'hash' => Captcha::Hash($code, $salt),
			'alive' => $conf->salt_pool_upd * ($conf->salt_pool_len - 1) // Время жизни капчи в секундах
		]);
	}
}