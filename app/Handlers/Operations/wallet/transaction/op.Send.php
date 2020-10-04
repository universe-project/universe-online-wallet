<?php

namespace App\Handlers\Operations\Wallet\Transaction;

use Iridium\Core\{
	Exceptions\OperationException,
	Http\Filter\FilterOption,
	Http\Filter\ValueType,
	Http\HTTP,
	Log\Log,
	Dispatcher\Operation
};

use App\Classes\{Transaction, UserSession};
use App\Restrictions\{LoginRestriction, NotLockRestriction};
use Iridium\Modules\Lang\Lang;


/**
 * Операция отправки средств.
 * @package App\Handlers\Operations\Wallet\Transaction
 */
final class SendOperation extends Operation
{
	protected function Prepare()
	{
		parent::Prepare();
		$this->Require(new LoginRestriction);
		$this->Require(new NotLockRestriction);
	}

	protected function Process()
	{
		$lang    = Lang::GetDictionary();
		$amount  = HTTP::GetPost('amount', ValueType::UFLOAT, 0.0, FilterOption::REQUIRED | FilterOption::STRICT);
		$address = HTTP::GetPost('address', ValueType::STRING, '', FilterOption::REQUIRED);
		$pin     = HTTP::GetPost('pin', ValueType::STRING, '');
		$user    = UserSession::GetInstance()->GetUser();

		Log::Info('Вызвана операция отправки средств.');

		if(!empty($user->GetOptions()->pin) && $pin !== $user->GetOptions()->pin)
		{
			throw new OperationException($this, $lang->FindPhrase('pin.wrong'));
		}

		$userAddresses = $user->GetAddressList();

		try
		{
			$transaction = new Transaction($amount, $userAddresses);
		}
		catch(\Throwable $e)
		{
			Log::Info("Не удалось создать транзакцию.\nПричина:\n{$e->getMessage()}");
			throw new OperationException($this, $e->getMessage());
		}

		$transaction->SetRecipientAddress($address);

		$changeAddress = $user->GetOptions()->changeAddress;
		if(empty($changeAddress))
		{
			// Выбор случайным образом
			$changeAddress = $userAddresses[mt_rand(0, count($userAddresses) - 1)];
			Log::Debug("Адрес для сдачи выбран случайным образом:\n{$changeAddress}");
		}

		$transaction->SetChangeAddress($changeAddress);

		try
		{
			$txid = $transaction->Send();
		}
		catch(\Throwable $e)
		{
			Log::Info("Не удалось отправить транзакцию.\nПричина:\n{$e->getMessage()}");
			throw new OperationException($this, $e->getMessage());
		}

		Log::Event("Отправлены средства.\nПользователь: {$user->email}\nСумма: {$amount}\nКоличество: {$transaction->GetFee()}\nАдрес: {$address}");

		// Отправляем идентификатор транзакции
		HTTP::SendJsonResponse($txid);
	}
}