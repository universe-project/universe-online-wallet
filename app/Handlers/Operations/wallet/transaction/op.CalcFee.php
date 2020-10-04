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
use App\Restrictions\LoginRestriction;


/**
 * Операция рассчёта комиссии для переданного количества валюты.
 * @package App\Handlers\Operations\Wallet\Transaction
 */
final class CalcFeeOperation extends Operation
{
	protected function Prepare()
	{
		parent::Prepare();
		$this->Require(new LoginRestriction);
	}

	protected function Process()
	{
		$amount = HTTP::GetRequest('amount', ValueType::UFLOAT, 0, FilterOption::REQUIRED | FilterOption::STRICT);
		Log::Debug('Запрос рассчёта комиссии.');

		try
		{
			$fee = (new Transaction($amount, UserSession::GetInstance()->GetUser()->GetAddressList()))->GetFee();
		}
		catch(\Throwable $e)
		{
			throw new OperationException($this, $e->getMessage());
		}

		HTTP::SendJsonResponse($fee);
	}
}