<?php

namespace App\Daemons;

use Iridium\Core\Log\Log;
use Iridium\Modules\Daemon\Daemon;


/**
 * Ротатор логов.
 * @package App\Daemons
 */
final class LogRotatorDaemon extends Daemon
{
	protected function GetSleepTime(): int
	{
		return 43200; // 12 h * 60 m * 60 s
	}

	protected function OnStart()
	{
		parent::OnStart();
		Log::Info('Запуск ротатора логов.');
	}

	protected function OnIterationBegin()
	{
		parent::OnIterationBegin();
		Log::Debug('Запуск задачи ротации логов.');
	}

	protected function Iteration()
	{
		$dir = ROOT_PATH . LOG_FILES_PATH;

		if(!file_exists($dir))
		{
			Log::Warning('Не удалось выполнить ротацию логов, так как директория логов не существует.');
			return;
		}

		$files = array_diff(scandir($dir), ['..', '.']);

		if(empty($files))
		{
			Log::Debug('Файлы логов отсутствуют.');
			return;
		}

		foreach($files as $file)
		{
			//Отсеиваем файлы без даты
			if(preg_match("/([0-9]{1,4}\\.{1}){3}log/i", $file) !== 1)
			{
				continue;
			}

			$expl         = explode('_', $file);
			$fileNameDate = str_replace('.log', '', end($expl));
			$fileDate     = date_create_from_format('Y.m.d', $fileNameDate);

			// Не удалось распознать дату
			if($fileDate === false)
			{
				continue;
			}

			$fileDate->add(new \DateInterval('P7D')); // + неделя

			if($fileDate < new \DateTime())
			{
				$path = $dir . $file;

				Log::Debug("Удаление файла логов {$file}.\nПолный путь: {$path}");

				if(!unlink($path))
				{
					Log::Warning("Не удалось удалить файл логов $file.");
				}
			}
		}
	}

	protected function OnIterationEnd()
	{
		parent::OnIterationEnd();
		Log::Debug('Окончание задачи ротации логов.');
		Log::Save();
	}

	protected function OnStop()
	{
		parent::OnStop();
		Log::Info('Остановка демона ротации логов.');
		Log::Save();
	}
}