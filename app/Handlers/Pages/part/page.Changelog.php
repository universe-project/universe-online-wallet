<?php

namespace App\Handlers\Pages\Part;
use Iridium\Modules\Page\AjaxPartPage;

/**
 * Частичная страница списка изменений.
 * @package App\Handlers\Pages\Part
 */
final class ChangelogPage extends AjaxPartPage
{
	/**
	 * Путь к файлу списка изменений относительно корневой директории.
	 */
	const CHANGELOG_FILE = 'changelog.json';

	protected function GetTemplateName(): string
	{
		return 'part/page.changelog.tpl';
	}

	protected function Prepare()
	{
		parent::Prepare();
		$this->SetTitle('Universe Wallet - Список изменений');

		$changelogFileContent = file_get_contents(ROOT_PATH . DIRECTORY_SEPARATOR . self::CHANGELOG_FILE);
		if($changelogFileContent !== false)
		{
			$changelog = json_decode($changelogFileContent, true);
		}

		$this->AddData(['changelog' => empty($changelog) ? [] : $changelog]);
	}
}