<?php


namespace App\Classes\Captcha;

/**
 * Пул солей.
 * @package site\classes
 */
final class SaltPool
{
	/**
	 * Байт, который указывает на активную запись в пул блоков.
	 */
	const WRITE_LOCK_ON = 'e';

	/**
	 * Байт, который указывает на отсутсвие записи в пул блоков в данный момент.
	 */
	const WRITE_LOCK_OFF = 'd';

	/**
	 * @var int Длина пула.
	 */
	private $length;

	/**
	 * @var Salt[] Список солей.
	 */
	private $list;

	/**
	 * @var int Идентификатор блока в Shared Memory, в котором хранится пул солей.
	 */
	private $smPoolId;

	/**
	 * @var int Идентификатор блока в Shared Memory, в котором хранится статус записи пула солей.
	 */
	private $smLockId;

	public function __construct(int $length, int $smPoolId, int $smLockId)
	{
		$this->length   = $length;
		$this->list     = [];
		$this->smPoolId = $smPoolId;
		$this->smLockId = $smLockId;
	}

	/**
	 * Блокирует поток, пока идёт запись пула в Shared Memory.
	 * @throws \Exception Если не удалось открыть блок или прочесть из него данные.
	 */
	private function WaitWhileWrite()
	{
		$block = @shmop_open($this->smLockId, 'a', 0, 0);

		// Если не удалось открыть блок, то, возможно, его еще не существует
		if($block === false)
		{
			return;
		}

		while(true)
		{
			$lock = shmop_read($block, 0, 1);

			if($lock === false)
			{
				shmop_close($block);
				throw new \Exception('Cannot read lock data from SM block.');
			}

			if($lock !== self::WRITE_LOCK_ON)
			{
				break;
			}
		}

		shmop_close($block);
	}

	/**
	 * Считывает пул солей из Shared Memory.
	 * Блокирует поток, если в данный момент идёт запись в пул.
	 * @return SaltPool Пул солей.
	 * @throws \Exception Если не удалось считать данные из Shared Memory.
	 */
	public function Load() : self
	{
		// Блокируем поток пока идёт запись солей
		$this->WaitWhileWrite();

		$poolBlock = @shmop_open($this->smPoolId, 'a', 0, 0);

		if($poolBlock === false)
		{
			throw new \Exception('Cannot open pool SM block.');
		}

		$size = shmop_size($poolBlock);
		$raw  = shmop_read($poolBlock, 0, $size);

		if($raw === false)
		{
			throw new \Exception('Shared Memory data read error.');
		}

		$this->list = []; // Очищаем предыдущие значения
		$saltSize   = Salt::LENGTH + Salt::ID_LENGTH;
		$length     = (int)($size / $saltSize);

		for($i = 0; $i < $length; $i++)
		{
			$start = $i * $saltSize;

			$this->list[] = new Salt(
				substr($raw, $start, Salt::ID_LENGTH),
				substr($raw, $start + Salt::ID_LENGTH, Salt::LENGTH)
			);
		}

		shmop_close($poolBlock);
		return $this;
	}

	/**
	 * Сохраняет список солей в Shared Memory.
	 * @return SaltPool Пул солей.
	 * @throws \Exception
	 */
	public function Save() : self
	{
		if(count($this->list) !== $this->length)
		{
			throw new \Exception('Cannot save pool because it must be filled.');
		}

		// Блокируем поток, пока не завершится другая активная запись
		$this->WaitWhileWrite();

		$lock = @shmop_open($this->smLockId, 'c', 0664, 1);
		if($lock === false)
		{
			throw new \Exception('Cannot open lock SM block.');
		}

		$block = @shmop_open($this->smPoolId, 'c', 0664, $this->GetSize());
		if($block === false)
		{
			shmop_close($lock);
			throw new \Exception('Cannot open pool SM block.');
		}

		// Преобразуем список солей в строку для последующей записи
		$data = '';
		foreach($this->list as $salt)
		{
			$data .= $salt->GetId() . $salt->GetSalt();
		}

		if(shmop_write($lock, self::WRITE_LOCK_ON, 0) !== 1)
		{
			shmop_close($lock);
			shmop_close($block);
			throw new \Exception('Cannot lock pool write. Cannot write data to the SM lock block.');
		}

		if(shmop_write($block, $data, 0) !== $this->GetSize())
		{
			shmop_close($lock);
			shmop_close($block);
			throw new \Exception('Cannot write pool to the SM. Cannot write data to the SM pool block.');
		}

		shmop_close($block);

		if(shmop_write($lock, self::WRITE_LOCK_OFF, 0) !== 1)
		{
			shmop_close($lock);
			throw new \Exception('Cannot unlock pool write. Cannot write data to the SM lock block.');
		}

		shmop_close($lock);
		return $this;
	}

	/**
	 * @return int Количество солей в пуле.
	 */
	public function GetLength() : int
	{
		return $this->length;
	}

	/**
	 * @return int Размер полностью заполненного пула в байтах.
	 */
	public function GetSize() : int
	{
		return $this->length * (Salt::LENGTH + Salt::ID_LENGTH);
	}

	/**
	 * @return Salt[] Список солей.
	 */
	public function GetSalts() : array
	{
		return $this->list;
	}

	/**
	 * @return Salt Первая соль в пуле.
	 * @throws \Exception Если пул пуст.
	 */
	public function GetFirst() : Salt
	{
		if(count($this->list) === 0)
		{
			throw new \Exception('List is empty.');
		}

		return $this->list[0];
	}

	public function SetSalts(array $salts)
	{
		if(count($salts) > $this->length)
		{
			throw new \InvalidArgumentException('Length of the array should be lower or equal than length of the pool.');
		}

		foreach($salts as $salt)
		{
			if(!is_a($salt, Salt::class))
			{
				throw new \InvalidArgumentException('Elements of the array should be instances of Salt class.');
			}
		}

		$this->list = $salts;
	}

	/**
	 * Помещает переданную соль в начало пула, удаляя последнюю соль пула, если она выходит за пределы размера пула.
	 * @param Salt $salt
	 */
	public function Push(Salt $salt)
	{
		array_unshift($this->list, $salt);

		if(count($this->list) > $this->length)
		{
			array_pop($this->list);
		}
	}

	/**
	 * Ищет и возвращает соль по идентификатору.
	 * Возвращает null, если соль не найдена.
	 * @param string $id Идентификатор соли.
	 * @return Salt|null Соль.
	 */
	public function GetById(string $id)
	{
		foreach($this->list as $salt)
		{
			if($salt->GetId() === $id)
			{
				return $salt;
			}
		}

		return null;
	}
}