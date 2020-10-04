/**
 * Страница подтверждения изменения e-mail адреса.
 */
pagesLoadData.emailChange = {
	link: '?page=part.wallet.changeEmail',
	onLoad: function()
	{
		var key = Iridium.UrlData.get('key'),
			uid = Iridium.UrlData.get('uid');

		document.getElementById('submit-btn').addEventListener('click', function(e)
		{
			e.preventDefault();

			/**
			 * Обработчик ответа на запрос подтверждения изменения e-mail адреса.
			 * @param result Данные результата операции.
			 */
			function confResult(result)
			{
				if(result.error)
				{
					displayError(
						lang.options.email.conf.errHeader,
						result.error.exception_class === 'InputFilterException' ?
							lang.options.email.conf.linkErr : result.error.message
					);
					return;
				}

				if(result === 0)
				{
					Iridium.UrlData.removeAll();
					loadPage('options');
				}
			}

			Iridium.Net.post(
				'?op=user.options.emailSubmit',
				{ key: key, uid: uid },
				confResult,
				Iridium.Net.DataType.JSON,
				function(type, data) { console.error(type + ' ' + data); }
			);
		});
	}
};