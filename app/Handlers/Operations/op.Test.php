<?php

namespace App\Handlers\Operations;

use App\Restrictions\CaptchaRestriction;
use Iridium\Core\Dispatcher\Operation;
use Iridium\Core\Http\HTTP;


final class TestOperation extends Operation
{
	protected function Prepare()
	{
		parent::Prepare();
		$this->Require(new CaptchaRestriction);
	}

	protected function Process()
	{
//		$result = (new Request("http://127.0.0.1:27353"))
//			->AddAuthorizationHeader('uniwallet', 'pass')
//			->SetContentType(ContentType::JSON)
//			->SetIgnoreErrors(true)
//			->Send(['method' => 'getinfo', 'params' => null, 'id' => 1]);
//
//
//		HTTP::SendJsonResponse($result);

		// Поиск отклонённых транзакций, добавленных в БД
//		$list = [];
//		$universe = new Universe();
//		$rows = MySql::GetRows("SELECT `txid` FROM `transactions`;");
//
//		foreach($rows as $row)
//		{
//			$tx = $universe->GetTransactionInfo($row['txid']);
//
//			if($tx->confirmations === -1)
//			{
//				$list[] = $row['txid'];
//			}
//		}
//
//		HTTP::SendJsonResponse($list);

		HTTP::SendJsonResponse($_SERVER['DOCUMENT_ROOT'] . DIRECTORY_SEPARATOR . 'storage/lock/');
	}
}