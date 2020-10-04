<?php

namespace App\Classes;

use Iridium\Core\Log\Log;
use Iridium\Modules\MySql\MySql;


/**
 * Данные пользователя.
 * @package App\Classes
 */
final class User
{
	/**
	 * @var int Идентификатор пользователя.
	 */
	public $id;

	/**
	 * @var string E-mail адрес пользователя.
	 */
	public $email;

	/**
	 * @var string Хеш пароля пользователя.
	 */
	private $passwordHash;

	/**
	 * @var UserOptions Параметры пользователя.
	 */
	private $options;

	public function __construct(int $id, string $email, string $passHash)
	{
		$this->id = $id;
		$this->email = $email;
		$this->passwordHash = $passHash;
	}

	public static function CreatePasswordHash(string $password) : string
	{
		return password_hash($password, PASSWORD_DEFAULT);
	}

	public static function CheckPasswordHash(string $password, string $hash) : bool
	{
		return password_verify($password, $hash);
	}

	/**
	 * Проверяет, является переданный пароль паролем пользователя.
	 * @param string $password Пароль.
	 * @return bool
	 */
	public function CheckPassword(string $password) : bool
	{
		return self::CheckPasswordHash($password, $this->passwordHash);
	}

	public function ChangePassword(string $password)
	{
		$hash = self::CreatePasswordHash($password);
		$this->passwordHash = $hash;
		MySql::Query("UPDATE `users` SET `pass_hash` = '{$hash}' WHERE `id` = '{$this->id}' LIMIT 1;");
	}

	/**
	 * Загружает список адресов пользователя из базы данных.
	 * @return array
	 */
	public function GetAddressList(): array
	{
		return array_map(
			function($row)
			{
				return $row['address'];
			},
			MySql::GetRows("SELECT `address` FROM `user_addresses` WHERE `user_id` = '{$this->id}';")
		);
	}

	/**
	 * @return UserOptions
	 */
	public function GetOptions() : UserOptions
	{
		if(empty($this->options))
		{
			$this->options = new UserOptions($this->id);
		}

		return $this->options;
	}

	/**
	 * Изменяет e-mail адрес пользователя на указанный.
	 * Не выполняет дополнительных проверок.
	 * @param string $email E-mail адрес.
	 * @throws \Exception
	 */
	public function ChangeEmail(string $email)
	{
		MySql::Query("UPDATE `users` SET `email` = '{$email}' WHERE `id` = {$this->id} LIMIT 1;");
		Log::Event("Пользователь изменил e-mail адрес.\nID пользователя: {$this->id}\nСтарый e-mail: {$this->email}\nНовый e-mail:{$email}");
		$this->email = $email;
	}
}