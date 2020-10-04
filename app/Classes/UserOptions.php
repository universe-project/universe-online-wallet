<?php

namespace App\Classes;
use Iridium\Modules\MySql\MySql;


/**
 * Параметры пользователя.
 * @package App\Classes
 */
final class UserOptions
{
	/**
	 * @var string|null Адрес сдачи.
	 */
	public $changeAddress;

	/**
	 * @var int Таймаут автоблокировки кошелька.
	 */
	public $autolockTimeout;

	/**
	 * @var int ПИН-код.
	 */
	public $pin;

	/**
	 * Таймауты блокировки кошелька.
	 */
	const AUTOLOCK_TIMES = [
		0,			// Никогда
		5 * 60,		// Через 5 минут
		10 * 60,	// Через 10 минут
		15 * 60,	// Через 15 минут
		30 * 60		// Через 30 минут
	];

	public function GetLockTimeoutId()
	{
		foreach(self::AUTOLOCK_TIMES as $i => $time)
		{
			if($time === $this->autolockTimeout)
			{
				return $i;
			}
		}

		return 0;
	}

	public function SetLockTimeoutId(int $id)
	{
		if(!array_key_exists($id, self::AUTOLOCK_TIMES))
		{
			$this->autolockTimeout = self::AUTOLOCK_TIMES[0];
			return;
		}

		$this->autolockTimeout = self::AUTOLOCK_TIMES[$id];
	}

	public function __construct(int $userId)
	{
		$dbOptions             = MySql::GetRow("SELECT `change_address`, `autolock_timeout`, `pin` FROM `users` WHERE `id` = '{$userId}' LIMIT 1;");
		$this->changeAddress   = $dbOptions['change_address'];
		$this->autolockTimeout = (int)$dbOptions['autolock_timeout'];
		$this->pin             = (string)$dbOptions['pin'];
	}

	public function SaveToDatabase(int $userId)
	{
		$changeAddr = DataOrNull($this->changeAddress);
		$pin = DataOrNull($this->pin);
		MySql::Query("UPDATE `users` SET `change_address` = {$changeAddr}, `autolock_timeout` = '{$this->autolockTimeout}', `pin` = {$pin} WHERE `id` = '{$userId}' LIMIT 1;");
	}
}