<?php

namespace App\Classes;
use Iridium\Core\Log\Log;
use Iridium\Modules\Lang\Lang;


/**
 * Транзакция.
 * @package App\Classes
 */
class Transaction
{
	/**
	 * Размер входа транзакции.
	 */
	const TR_IN_SIZE = 180;

	/**
	 * Размер выхода транзакции.
	 */
	const TR_OUT_SIZE = 34;

	/**
	 * Максимальное количество попыток поиска входов транзакции и комиссии.
	 */
	const INS_SEARCH_LIMIT = 30;

	/**
	 * @var float Количество.
	 */
	protected $amount;

	/**
	 * @var string Адрес.
	 */
	protected $recipientAddress;

	/**
	 * @var string[] Адреса отправителя.
	 */
	protected $senderAddresses;

	/**
	 * @var string Адрес сдачи.
	 */
	protected $changeAddress;

	/**
	 * @var bool Была ли подготовлена транзакция.
	 */
	private $prepared = false;

	/**
	 * @var Universe Узел криптовалюты.
	 */
	protected $universe;

	/**
	 * @var array Входы транзакции.
	 */
	protected $inputs;

	/**
	 * @var float Комиссия за транзакцию.
	 */
	protected $fee;

	/**
	 * @var float Базовая комиссия.
	 */
	protected $baseFee;

	/**
	 * Создаёт новую транзакцию.
	 * @param float $amount Количество.
	 * @param array $senderAddresses Адреса отправителя.
	 * @throws \Exception Заданное количество меньше или равно нулю.
	 */
	public function __construct(float $amount, array $senderAddresses)
	{
		$this->universe        = new Universe;
		$this->amount          = $amount;
		$this->senderAddresses = $senderAddresses;
		$this->baseFee         = $GLOBALS['config']['fee'];
		$this->fee             = 0;

		if($this->amount <= 0)
		{
			throw new \Exception(Lang::GetDictionary()->FindPhrase('trans.err.above_zero'));
		}

		Log::Debug('Создана новая транзакция.');
	}

	/**
	 * Устанавливает адрес получателя.
	 * @param string $address Адрес получателя.
	 * @return Transaction Транзакция.
	 */
	public function SetRecipientAddress(string $address): self
	{
		$this->recipientAddress = $address;
		return $this;
	}

	/**
	 * Устанавливает адрес сдачи.
	 * @param string $address Адрес сдачи.
	 * @return Transaction Транзакция.
	 */
	public function SetChangeAddress(string $address): self
	{
		$this->changeAddress = $address;
		return $this;
	}

	/**
	 * Подготавливает транзакцию.
	 * @throws \Exception
	 */
	private function Prepare()
	{
		Log::Debug('Начата подготовка транзакции.');

		$lang        = Lang::GetDictionary();
		$unspentOuts = $this->universe->GetUnspentOuts($GLOBALS['config']['maturation'], 99999999, $this->senderAddresses);
		$userAmount  = array_sum(array_map(function($uout) { return $uout->amount; }, $unspentOuts));

		Log::Debug("Непотраченные выходы пользователя:\n" . json_encode($unspentOuts));

		$this->fee = $this->baseFee;
		$prevFee   = 0;
		$i         = 0;

		// Ищем непотраченные выходы и комиссию, удовлетворяющие условию:
		// Сумма непотраченных выходов и комиссии должна быть меньше или равна балансу пользователя

		do
		{
			if($userAmount <= 0 || $userAmount < $this->amount + $this->fee)
			{
				throw new \Exception($lang->FindPhrase('trans.err.not_enough'));
			}

			$this->inputs = $this->SelectOuts($unspentOuts, $this->amount + $this->fee);
			$prevFee      = $this->fee;
			$this->fee    = max($this->baseFee, $this->CalculateFee());

			if(++$i > self::INS_SEARCH_LIMIT)
			{
				Log::Error("Достигнут лимит количества попыток поиска входов транзакции и комиссии.\nЛимит: {$i}");
				throw new \Exception($lang->FindPhrase('trans.err.fee_calc'));
				break;
			}
		} while($prevFee !== $this->fee);

		$this->prepared = true;

		Log::Debug("Окончена подготовка транзакции.\nКол-во итераций: {$i}");
	}

	/**
	 * Выполняет рассчёт приблизительного размера транзакции.
	 * @return int Приблизительный размер транзакции.
	 */
	protected function CalculateSize(): int
	{
		$outsCount = 2; // Сдача + получатель
		$inputsCount = count($this->inputs);
		return (int)($inputsCount * self::TR_IN_SIZE + $outsCount * self::TR_OUT_SIZE + $inputsCount / 2);
	}

	/**
	 * Выполняет рассчёт комиссии за транзакцию.
	 * @return float Комиссия за транзакцию.
	 */
	protected function CalculateFee(): float
	{
		return $this->baseFee * (1 + $this->CalculateSize() / 1000);
	}

	/**
	 * @return float Комиссия за транзакцию.
	 * @throws \Exception
	 */
	public function GetFee(): float
	{
		if(!$this->prepared)
		{
			$this->Prepare();
		}

		return $this->fee;
	}

	/**
	 * @return float Количество.
	 */
	public function GetAmount(): float
	{
		return $this->amount;
	}

	/**
	 * Отправляет транзакцию.
	 * @return string Идентификатор транзакции (txid).
	 * @throws \Exception Не задан адрес сдачи.
	 * @throws \Exception Не задан адрес получателя.
	 * @throws \Exception Указан неверный адрес получателя.
	 */
	public function Send() : string
	{
		if(!$this->prepared)
		{
			$this->Prepare();
		}

		Log::Debug('Отправка транзакции.');

		$lang = Lang::GetDictionary();

		if(empty($this->changeAddress))
		{
			throw new \Exception($lang->FindPhrase('trans.err.change_addr'));
		}

		if(empty($this->recipientAddress))
		{
			throw new \Exception($lang->FindPhrase('trans.err.recipient_addr'));
		}

		if(!$this->universe->GetAddressInfo($this->recipientAddress)->isvalid)
		{
			throw new \Exception($lang->FindPhrase('trans.err.invalid_recipient'));
		}

		$inputsSum = array_sum(array_map(function($uout) { return $uout->amount; }, $this->inputs));
		$inputs    = array_map(function($out) { return ['txid' => $out->txid, 'vout' => $out->vout]; }, $this->inputs);

		Log::Debug("Входы транзакции:\n" . json_encode($inputs));

		// Комиссия = сумма всех входов - (кол-во для отправки + сдача)
		// Сдача = сумма всех входов - (кол-во для отправки + комиссия)
		$change = $inputsSum - $this->amount - $this->fee;

		// Выходы транзакции
		$outs = [];

		// Если адрес получателя совпадает с адресом сдачи, то сумируем сдачу с кол-вом отправки, иначе вся сдача уйдёт
		// в комиссию!
		if($this->recipientAddress === $this->changeAddress)
		{
			$outs[$this->recipientAddress] = $this->amount + $change;
		}
		else
		{
			$outs[$this->changeAddress]    = $change;
			$outs[$this->recipientAddress] = $this->amount;
		}

		// Формируем транзакцию
		$rawTransaction = $this->universe->CreateRawTransaction($inputs, $outs);

		// Подписываем транзакцию
		$signed = $this->universe->SignRawTransaction($rawTransaction);

		// Проверяем удалось ли подсписать транзакцию.
		if(!$signed->complete)
		{
			throw new \Exception($lang->FindPhrase('trans.err.sign'));
		}

		$decoded = $this->universe->DecodeRawTransaction($signed->hex);
		Log::Debug("Тело транзакции:\n" . json_encode($decoded));

		$size = $this->CalculateSize();

		Log::Debug("Отладочная информация транзакции:\n\tКоличество: {$this->amount}\n\tКомиссия: {$this->fee}\n\tБазовая комиссия: {$this->baseFee}\n\tСдача: {$change}\n\tАдрес получателя: {$this->changeAddress}\n\tАдрес сдачи: {$this->changeAddress}\n\tРазмер: {$size}");

		// Отправляем транзацию
		return $this->universe->SendRawTransaction($signed->hex);
	}

	/**
	 * Ищет и возвращает непотраченные выходы, сумма которых равна или превышает заданное количество ($amount).
	 * @param \stdClass[] $outs Все непотраченные выходы.
	 * @param float $amount Кол-во и комиссия.
	 * @return array Выбранные непотрыченные выходы.
	 */
	protected function SelectOuts(array $outs, float $amount) : array
	{
		// TODO: использовать графы
		// TODO: посмотреть реализацию этого метода в стационарном кошельке (метод SelectCoins)

		foreach($outs as $out)
		{
			if($out->amount < $amount)
			{
				continue;
			}

			if(!isset($currentOut) || $out->amount < $currentOut->amount)
			{
				$currentOut = $out;
			}
		}

		// Найден ближайший по кол-ву непотраченный выход, который больше требуемого кол-ва
		if(isset($currentOut))
		{
			return [$currentOut];
		}

		// Сумма кол-в выбранных непотраченных входов
		$sum = 0;
		$result = [];

		// Не делаем дополнительного условия выхода из цикла, так как в методе Process есть проверка, которая
		// подтверждает что сумма всех кол-в непотраченных выходов больше или равна требуемому кол-ву + комиссии
		while($sum < $amount)
		{
			$diff = $sum - $amount;

			foreach($outs as $i => $out)
			{
				// Если еще не задан непотраченный выход для сравнения ИЛИ если текущий ($out) непотраченный выход
				// "ближе" к целевому значению, чем предыдущий ($currentOut)
				if(!isset($currentOut) || abs($out->amount + $diff) < abs($currentOut->amount + $diff))
				{
					$currentOut = $out;
					$index = $i;
				}
			}

			// Добавляем кол-во непотреченного входа к сумме
			$sum += $currentOut->amount;

			// Выбираем непотраченный вход
			$result[] = $currentOut;

			// Удаляем выбранный непотраченный выход
			unset($outs[$index]);

			// "Забываем" найденный непотраченный выход
			unset($currentOut);
		}

		return $result;
	}
}