<?php

namespace App\Classes\Captcha;


/**
 * Соль для капчи.
 * @package site\classes\salt
 */
final class Salt
{
	/**
	 * @var string Идентификатор соли.
	 */
	private $id;

	/**
	 * @var string Соль.
	 */
	private $salt;

	/**
	 * Длина соли в байтах (символах).
	 */
	const LENGTH = 32;

	/**
	 * Длина идентификатора соли в байтах (символах).
	 */
	const ID_LENGTH = 8;

	/**
	 * Создаёт объект соли с заданным id и солью.
	 * @param string $id Идентификатор.
	 * @param string $salt Соль.
	 */
	public function __construct(string $id, string $salt)
	{
		$this->id = $id;
		$this->salt = $salt;
	}

	/**
	 * @return string Идентификатор соли.
	 */
	public function GetId() : string
	{
		return $this->id;
	}

	/**
	 * @return string Соль.
	 */
	public function GetSalt() : string
	{
		return $this->salt;
	}

	/**
	 * Генерирует и возвращает новую соль.
	 * @return Salt Сгенерированная соль.
	 */
	public static function Generate(): self
	{
		return new self(
			hash('crc32', strval(microtime(true))),
			RandomToken(self::LENGTH)
		);
	}
}