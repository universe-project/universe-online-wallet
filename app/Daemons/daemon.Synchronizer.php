<?php

namespace App\Daemons;

use Iridium\Core\Log\Log;
use Iridium\Modules\{Daemon\Daemon, MySql\MySql};
use App\Classes\Universe;


/**
 * Демон для репликации списка транзакций узла криптовалюты в БД.
 * @package App\Daemons
 */
final class SynchronizerDaemon extends Daemon
{
	/**
	 * Кол-во транзакций, которое извлекается за один раз.
	 */
	const CHUNK_AMOUNT = 10;

	/**
	 * @var string Идентификатор последней, добавленной в базу, транзакции.
	 */
	private $lastTransactionId;

	/**
	 * @var Universe Узел криптовалюты.
	 */
	private $universe;

	/**
	 * @var string[] Последние добавленные транзакции.
	 */
	private $lastTransactions;

	protected function GetSleepTime(): int
	{
		return $GLOBALS['config']['transactions_sync_time'];
	}

	protected function OnStart()
	{
		parent::OnStart();

		Log::Info("Запуск демона.");
		Log::Save();
		MySql::Close();
		$this->universe = new Universe();
	}

	protected function OnIterationBegin()
	{
		parent::OnIterationBegin();
		MySql::Connect();
		Log::Debug("Начало итерации.");
	}

	protected function Iteration()
	{
		$this->lastTransactionId = $this->FindLastTxid();
		$last = $this->GetLastTransactions();

		if(isset($this->lastTransactionId))
		{
			Log::Info("Идентификатор последней добавленной неотклонённой транзакции: {$this->lastTransactionId}.");
		}

		if(empty($last))
		{
			Log::Debug("Нет новых транзакций.");
		}
		else
		{
			$this->lastTransactions = $last;
			Log::Debug("Будут добавлены следующие новые транзакции: \n" . var_export($this->lastTransactions, true));
		}

		foreach($last as $i => $txid)
		{
			// Получаем информацию о транзакции
			$txInfo = $this->universe->GetTransactionInfo($txid);

			// Неподтверждённая транзакция
			// Вероятно всегда ложно
			if($txInfo->confirmations < 0)
			{
				continue;
			}

			// Если true, то это транзакция добычи
			$generated = isset($txInfo->generated) && $txInfo->generated;

			// Данные входов транзакции
			$ins = [];

			foreach($txInfo->vin as $in)
			{
				$outOfIn = $this->universe->GetTransactionInfo($in->txid)->vout[$in->vout];
				$ins[] = [
					'amount' => $outOfIn->value,
					'address' => $outOfIn->scriptPubKey->addresses[0]
				];
			}

			// Данные выходов транзакции
			$outs = [];

			foreach($txInfo->vout as $vout)
			{
				if(!isset($vout->scriptPubKey->addresses))
				{
					continue;
				}

				$outs[] = [
					'amount' => $vout->value,
					'address' => $vout->scriptPubKey->addresses[0]
				];
			}

			$query = "INSERT INTO `transactions` SET `txid` = '$txid', ";

			$fee = isset($txInfo->fee) ? abs($txInfo->fee) : 0;

			$query .= "`generated` = '" . ($generated ? '1' : '0') . "', ";
			$query .= "`fee` = '$fee', ";
			$query .= "`timestamp` = FROM_UNIXTIME({$txInfo->time});";

			try
			{
				// Добавляем транзакцию в базу
				MySql::Query($query);
			}
			catch(\Throwable $e)
			{
				Log::Error("Ошибка при добавлении транзакции в базу данных!\nindex: $i\n$e");
			}

			// Входы и выходы

			$inoutQuery = "INSERT INTO `transaction_ins_outs`(`txid`, `type`, `address`, `amount`) VALUES ";

			foreach($ins as $in)
			{
				$inoutQuery .= "('$txid',0,'{$in['address']}','{$in['amount']}'),";
			}

			foreach($outs as $out)
			{
				$inoutQuery .= "('$txid',1,'{$out['address']}','{$out['amount']}'),";
			}

			$inoutQuery[strlen($inoutQuery) - 1] = ';';

			try
			{
				MySql::Query($inoutQuery);
			}
			catch(\Throwable $e)
			{
				Log::Error("Ошибка при добавлении входов и выходов транзакции в базу данных!\nindex: $i\n$e");
			}
		}

		if(isset($i))
		{
			Log::Event('Добавлено транзакций в базу: ' . ($i + 1) . '.');
		}
	}

	protected function OnIterationEnd()
	{
		parent::OnIterationEnd();

		MySql::Close();
		Log::Debug("Остановка итерации.");
		Log::Save();
	}

	protected function OnStop()
	{
		Log::Info("Остановка демона.");
		Log::Save();
		parent::OnStop();
	}

	/**
	 * @return array Список идентификаторов последних недобавленных транзакций.
	 */
	private function GetLastTransactions() : array
	{
		$end = false;
		$skip = 0;
		$txids = [];

		while(!$end)
		{
			$lastTransactions = $this->universe->GetTransactions('*', self::CHUNK_AMOUNT, $skip);
			$skip += self::CHUNK_AMOUNT;

			// Транзакции закончились
			if(count($lastTransactions) === 0)
			{
				break;
			}

			// Получаем только идентификаторы транзакций
			$lastTransactions = array_map(function($tx)
			{
				return $tx->txid;
			}, $lastTransactions);

			// Убираем повторяющиеся значения
			// Для внутренних транзакций узел КВ (криптовалюты) создаёт 4 записи о транзакции
			$lastTransactions = array_unique($lastTransactions);

			// Обратный порядок, так как ф-я listtransactions возвращает подмножество в порядке возрастания по времени
			$lastTransactions = array_reverse($lastTransactions);

			// Извлекаем все транзакции до ранее найденной
			if(!empty($this->lastTransactionId))
			{
				$key = array_search($this->lastTransactionId, $lastTransactions);

				// Добрались до транзакции, обработанной в предыдущей итерации
				if($key !== false)
				{
					Log::Debug("end: $key");

					if($key === 0)
					{
						$lastTransactions = [];
					}
					else
					{
						$lastTransactions = array_splice($lastTransactions, 0, $key);
					}

					$end = true;
				}
			}

			$txids = array_merge($txids, $lastTransactions);
		}

		// Удаляем повторы и возвращаем массив
		// Повторы могут быть на стыках "порций"
		return array_unique($txids);
	}

	/**
	 * Ищет и возвращает идентификатор последней неотклонённой (кол-во подтверждений >= 0) транзакции.
	 * @return string Идентификатор последней транзакции.
	 */
	private function FindLastTxid() : string
	{
		Log::Debug("Начат поиск последней добавленной неотклонённой транзакции.");

		// Ищем в последних добавленных транзакциях (если они есть)
		if(!empty($this->lastTransactions))
		{
			foreach($this->lastTransactions as $txid)
			{
				$txInfo = $this->universe->GetTransactionInfo($txid);

				if($txInfo->confirmations >= 0)
				{
					Log::Debug("Последняя добавленная неотклонённая транзакция была найдена в ОЗУ.");
					return $txid;
				}
			}
		}

		if(!empty($this->lastTransactions))
		{
			$skip = count($this->lastTransactions);
		}
		else
		{
			$skip = 0;
		}

		// Ищем в транзакциях, которые уже были добавлены в базу
		while(true)
		{
			$txids = MySql::GetRows("SELECT `txid` FROM `transactions`  ORDER BY `timestamp` DESC LIMIT {$skip}," . self::CHUNK_AMOUNT . ";");

			if(empty($txids))
			{
				break;
			}

			foreach($txids as $row)
			{
				$txInfo = $this->universe->GetTransactionInfo($row['txid']);
				if($txInfo->confirmations > 0)
				{
					Log::Debug("Последняя добавленная неотклонённая транзакция была найдена в базе данных.");
					return $row['txid'];
				}
			}

			$skip += self::CHUNK_AMOUNT;
		}

		Log::Debug("Последняя добавленная неотклонённая транзакция НЕ была найдена.");
		return '';
	}
}