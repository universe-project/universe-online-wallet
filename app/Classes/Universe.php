<?php

namespace App\Classes;
use Iridium\Modules\Cryptocurrency\Cryptocurrency;


final class Universe extends Cryptocurrency
{
	/**
	 * @param int $minConf
	 * @param int $maxConf
	 * @param array $addresses
	 * @return \stdClass[] List of the unspent outs.
	 */
	public function GetUnspentOuts(int $minConf = 1, int $maxConf = 9999999, array $addresses = []) : array
	{
		return $this->SendRequest('listunspent', $minConf, $maxConf, $addresses);
	}

	/**
	 * Returns list of the transactions.
	 * Do not return rejected transactions (with confirminations = -1).
	 * @param string $label Label of the address.
	 * @param int $count Count.
	 * @param int $from Skip amount.
	 * @return array List of the transactions.
	 */
	public function GetTransactions(string $label, $count = 10, $from = 0) : array
	{
		return $this->SendRequest('listtransactions', $label, $count, $from);
	}

	/**
	 * Creates new raw transactions with specified inputs and outputs.
	 * @param array $inputs Array of arrays that contains key "txid" and "vout" of transaction inputs.
	 * @param array $outputs Array of outputs of the transaction (address => amount).
	 * @return string Encoded transaction.
	 */
	public function CreateRawTransaction(array $inputs, array $outputs) : string
	{
		return $this->SendRequest('createrawtransaction', $inputs, $outputs);
	}

	public function DecodeRawTransaction(string $transactionHex) : \stdClass
	{
		return $this->SendRequest('decoderawtransaction', $transactionHex);
	}

	public function SignRawTransaction(string $transactionHex) : \stdClass
	{
		return $this->SendRequest('signrawtransaction', $transactionHex);
	}

	/**
	 * @param string $transactionHex Hex of the raw transaction.
	 * @return string Transaction ID.
	 */
	public function SendRawTransaction(string $transactionHex) : string
	{
		return $this->SendRequest('sendrawtransaction', $transactionHex);
	}

	public function GetAddressInfo(string $address) : \stdClass
	{
		return $this->SendRequest('validateaddress', $address);
	}

	public function GetTransactionInfo(string $txid) : \stdClass
	{
		return $this->SendRequest('gettransaction', $txid);
	}
}