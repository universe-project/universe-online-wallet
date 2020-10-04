<?php

namespace App\Handlers\Operations;

use Iridium\Core\EmailLetter;
use Iridium\Core\Http\Filter\FilterOption;
use Iridium\Core\Http\Filter\ValueType;
use Iridium\Core\Http\HTTP;
use Iridium\Core\Dispatcher\Operation;


/**
 * Операция тестирования отправки e-mail.
 * @package App\Handlers\Operation
 */
final class TestEmailOperation extends Operation
{
	const OP_KEY = 'voxtel';

	protected function Process()
	{
		$defaultMessage = "Test message.<br><br>Link: <a href=\"https://uniwallet.io/\">UOW</a><br><br>Some another text";

		$key     = HTTP::GetGet('key', ValueType::STRING, '');
		$address = HTTP::GetGet('address', ValueType::STRING, '', FilterOption::REQUIRED);
		$subject = HTTP::GetGet('subject', ValueType::STRING, 'No subject');
		$message = HTTP::GetGet('message', ValueType::STRING, $defaultMessage);

		if($key === self::OP_KEY)
		{
			$email = new EmailLetter($message, $subject);
			$email->AddRecipient($address);
			$email->Send();
		}

		HTTP::SendJsonResponse(0);
	}
}