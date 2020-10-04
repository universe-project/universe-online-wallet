<?php

namespace App\Daemons;

use Iridium\Core\Log\Log;
use Iridium\Modules\{Daemon\Daemon, MySql\MySql};
use App\Classes\Universe;


/**
 * Чистильщик базы данных.
 * @package App\Daemons
 */
final class DatabaseCleanerDaemon extends Daemon
{
	protected function GetSleepTime(): int
	{
		return 21600; // 6 h * 60 m * 60 s
	}

	protected function OnStart()
	{
		parent::OnStart();
		MySql::Reconnect();
		Log::Info('Запуск демона.');
	}

	protected function OnIterationBegin()
	{
		parent::OnIterationBegin();
		Log::Debug('Начало итерации.');
		MySql::Connect();
	}

	protected function Iteration()
	{
		try
		{
			$this->CleanUsers();
			$this->CleanEmailChangeRequests();
			$this->CleanPassResetRequests();
			$this->CleanRejectedTransactions();
		}
		catch(\Throwable $e)
		{
			Log::Error($e);
		}
	}

	protected function OnIterationEnd()
	{
		parent::OnIterationEnd();
		Log::Debug('Окончание итерации.');
		Log::Save();
		MySql::Close();
	}

	protected function OnStop()
	{
		parent::OnStop();
		Log::Info('Остановка демона.');
	}

	/**
	 * Удаляет пользователей, которые не были активированы более заданного времени.
	 */
	private function CleanUsers()
	{
		$timeout = $GLOBALS['config']['user']['email_activation_timeout'];
		$ids     = MySql::GetRows("
SELECT `id` FROM `users`
WHERE
	UNIX_TIMESTAMP(`register_timestamp`) + '{$timeout}' < UNIX_TIMESTAMP(NOW())
	AND `id` IN (SELECT `user_id` FROM `user_activation`);
		");

		if(empty($ids))
		{
			return;
		}

		$ids = implode(',', array_map(function($id) { return "'{$id['id']}'"; }, $ids));

		MySql::Query("DELETE FROM `users` WHERE `id` IN ($ids);");
		MySql::Query("DELETE FROM `user_activation` WHERE `user_id` IN ($ids);");
	}

	/**
	 * Удаляет устаревшие заявки на изменение e-mail адреса.
	 */
	private function CleanEmailChangeRequests()
	{
		$timeout = $GLOBALS['config']['user']['email_change_timeout'];
		MySql::Query("DELETE FROM `change_email_requests` WHERE UNIX_TIMESTAMP(`timestamp`) + '{$timeout}' < UNIX_TIMESTAMP(NOW());");
	}

	/**
	 * Удаляет устаревшие заявки на сброс пароля.
	 */
	private function CleanPassResetRequests()
	{
		$timeout = $GLOBALS['config']['user']['pass_reset_timeout'];
		MySql::Query("DELETE FROM `reset_pass_requests` WHERE UNIX_TIMESTAMP(`timestamp`) + '{$timeout}' < UNIX_TIMESTAMP(NOW());");
	}

	/**
	 * Удаляет отклонённые транзакции из базы данных.
	 */
	private function CleanRejectedTransactions()
	{
		$universe  = new Universe();
		$chunkSize = 10;
		$skip      = 0;
		$list      = [];

		while(true)
		{
			$chunk = MySql::GetRows("SELECT `txid` FROM `transactions` LIMIT {$skip},{$chunkSize};");

			if(empty($chunk))
			{
				break;
			}

			foreach($chunk as $row)
			{
				$txInfo = $universe->GetTransactionInfo($row['txid']);

				if($txInfo->confirmations === -1)
				{
					$list[] = "'" . $row['txid'] . "'";
				}
			}

			$skip += $chunkSize;
		}

		if(empty($list))
		{
			Log::Debug("Не найдено ни одной отклонённой транзакции в БД.");
		}
		else
		{
			Log::Info('Найдено ' . count($list) . ' отклонённых транзакций в БД. Удалить их все!');
			MySql::Query("DELETE FROM `transactions` WHERE `txid` IN (" . implode(',', $list) . ");");
		}
	}
}