<?php

namespace App\Classes\Captcha;
use Iridium\Core\Log\Log;


/**
 * Содержит методы для хеширования и проверки капчи.
 * @package site\classes\salt
 */
final class Captcha
{
	/**
	 * Длина хеша капчи в байтах.
	 */
	const HASH_LENGTH = 64;

	/**
	 * Хеширует капчу с солью.
	 * @param string $captcha Капча.
	 * @param Salt $salt Соль.
	 * @return string Хеш капчи.
	 */
	public static function Hash(string $captcha, Salt $salt) : string
	{
		return $salt->GetId() . hash('sha256', $captcha . $salt->GetSalt() . $salt->GetId());
	}

	/**
	 * Проверяет капчу на соответствие хешу.
	 * @param string $captcha Капча.
	 * @param string $hash Хеш капчи с идентификатором соли.
	 * @return bool True, если капча соответствует хешу.
	 */
	public static function Check(string $captcha, string $hash) : bool
	{
		if(strlen($hash) !== self::HASH_LENGTH + Salt::ID_LENGTH)
		{
			Log::Warning('Во время проверки капчи передан хеш неподходящей длины.');
			return false;
		}

		$saltId = substr($hash, 0, Salt::ID_LENGTH);

		$conf = (object)$GLOBALS['config']['captcha'];
		$pool = new SaltPool($conf->salt_pool_len, $conf->sm_salt_id, $conf->sm_wlock_id);

		$pool->Load();
		$salt = $pool->GetById($saltId);

		if($salt === null)
		{
			Log::Debug('Во время проверки капчи не была найдена соль по идентификатору.');
			return false;
		}

		$newHash = self::Hash($captcha, $salt);

		Log::Debug("Проверка капчи.\nВведённая капча: {$captcha}\nid соли: {$saltId}\nСоль: {$salt->GetSalt()}\nХеш, переданный пользователем: {$hash}\nХеш проверки: {$newHash}");

		return $hash === $newHash;
	}
}