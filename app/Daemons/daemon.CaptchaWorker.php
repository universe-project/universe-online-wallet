<?php

namespace App\Daemons;

use Iridium\Core\Log\Log;
use Iridium\Modules\Daemon\Daemon;
use App\Classes\Captcha\{Salt, SaltPool};


/**
 * Демон, обеспечивающий работу капчи.
 * @package App\Daemons
 */
final class CaptchaWorkerDaemon extends Daemon
{
	/**
	 * @var bool Если true, то в данный момент - первая итерация демона.
	 */
	private $firstIteration;

	/**
	 * @var \stdClass Параметры.
	 */
	private $conf;

	protected function GetSleepTime(): int
	{
		return $this->conf->salt_pool_upd;
	}

	protected function OnStart()
	{
		parent::OnStart();

		$this->conf = (object)$GLOBALS['config']['captcha'];
		$this->firstIteration = true;

		Log::Info("Запуск демона. Новая соль будет генерироваться раз в {$this->conf->salt_pool_upd} сек.");
		Log::Debug('Начальное заполнение пула солей.');

		$pool = $this->CreatePoolObject();
		$list = [];

		for($i = 0; $i < $pool->GetLength(); $i++)
		{
			$list[] = Salt::Generate();
		}

		try
		{
			$pool->SetSalts($list);
			$pool->Save();
		}
		catch(\Throwable $e)
		{
			Log::Error("Не удалось добавить соли в пул при инициализации.\n{$e}");
			Log::Save();
			return;
		}

		Log::Debug("Пул заполнен. Добавлено {$i} солей.");
		Log::Save();
	}

	protected function OnIterationBegin()
	{
		parent::OnIterationBegin();
		Log::Debug('Начало новой итерации.');
	}

	protected function Iteration()
	{
		// Пропускаем первую итерацию
		if($this->firstIteration)
		{
			Log::Debug('Пропуск первой итерации.');
			$this->firstIteration = false;
			return;
		}
		
		$pool = $this->CreatePoolObject();

		try
		{
			$pool->Load();
			$pool->Push(Salt::Generate());
			$pool->Save();
		}
		catch(\Throwable $e)
		{
			Log::Error("Не удалось добавить новую соль в пул.\n{$e}");
			return;
		}

		Log::Debug('В пул добавлена новая соль.');
	}

	protected function OnIterationEnd()
	{
		parent::OnIterationEnd();
		Log::Debug('Окончание итерации.');
		Log::Save();
	}

	protected function OnStop()
	{
		parent::OnStop();
		Log::Debug('Остановка демона.');
		Log::Save();
	}

	private function CreatePoolObject() : SaltPool
	{
		return new SaltPool(
			$this->conf->salt_pool_len,
			$this->conf->sm_salt_id,
			$this->conf->sm_wlock_id
		);
	}
}