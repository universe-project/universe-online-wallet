<?php

namespace App\Restrictions;

use Iridium\Core\Http\{HTTP, Filter\ValueType, Filter\FilterOption};
use Iridium\Core\Restriction\Restriction;
use App\Classes\Captcha\Captcha;
use Iridium\Modules\Lang\Lang;

/**
 * Ограничение по требованию правильной капчи.
 * @package App\Restrictions
 */
final class CaptchaRestriction extends Restriction
{
	public function Check(): bool
	{
		return Captcha::Check(
			HTTP::GetRequest('captcha', ValueType::STRING, '', FilterOption::MULTIBITE | FilterOption::REQUIRED),
			HTTP::GetRequest('captcha_hash', ValueType::STRING, '', FilterOption::REQUIRED)
		);
	}

	public function GetFailedCheckMessage(): string
	{
		return Lang::GetDictionary()->FindPhrase('captcha.wrong');
	}

	public function GetCode(): string
	{
		return 'captcha';
	}
}