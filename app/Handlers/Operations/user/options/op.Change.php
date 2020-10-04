<?php

namespace App\Handlers\Operations\User\Options;

use Iridium\Core\Exceptions\OperationException;
use Iridium\Core\Http\Filter\ValueType;
use Iridium\Core\Http\HTTP;
use Iridium\Core\Dispatcher\Operation;
use Iridium\Modules\Lang\Lang;
use Iridium\Modules\MySql\MySql;
use App\Classes\UserSession;
use App\Restrictions\LoginRestriction;
use App\Restrictions\NotLockRestriction;


/**
 * Операция редактирование настроек пользователя.
 * @package App\Handlers\Operations\User\Options
 */
final class ChangeOperation extends Operation
{
	protected function Prepare()
	{
		parent::Prepare();
		$this->Require(new LoginRestriction);
		$this->Require(new NotLockRestriction);
	}

	/**
	 * @throws OperationException
	 * @throws \Iridium\Core\Http\Filter\InputFilterException
	 * @throws \Exception
	 */
	protected function Process()
	{
		$lang          = Lang::GetDictionary();
		$changeAddress = HTTP::GetPost('change_address', ValueType::STRING, '');
		$lockTimeId    = HTTP::GetPost('lock_time', ValueType::UINT, 0);
		$pin           = HTTP::GetPost('pin', ValueType::STRING, '');
		$user          = UserSession::GetInstance()->GetUser();
		$userOptions   = $user->GetOptions();

		// Проверяем адрес сдачи, если он указан
		if(!empty($changeAddress))
		{
			if(!(bool)MySql::GetCell("SELECT COUNT(*) > 0 FROM `user_addresses` WHERE `address` = '{$changeAddress}' AND `user_id` = '{$user->id}' LIMIT 1;"))
			{
				throw new OperationException($this, $lang->FindPhrase('options.err.no_change_addr'));
			}
		}

		// Проверяем PIN, если он введён
		if(!(empty($pin) || MatchPattern(PIN_REGEX, $pin)))
		{
			throw new OperationException($this, $lang->FindPhrase('options.err.pin_format'));
		}

		$userOptions->changeAddress = $changeAddress;
		$userOptions->pin           = $pin;
		$userOptions->SetLockTimeoutId($lockTimeId);
		$userOptions->SaveToDatabase($user->id);

		HTTP::SendJsonResponse(['autolockTimeout' => $userOptions->autolockTimeout]);
	}
}