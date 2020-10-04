/**
 * Страница активации аккаунта
 */
pagesLoadData.activation = {
	link: '?page=part.activation',
	onLoad: function()
	{
		var key = Iridium.UrlData.get('key'),
			uid = Iridium.UrlData.get('uid');

		document.getElementById('activate-account-btn').addEventListener('click', function(e)
		{
			e.preventDefault();

			Iridium.Net.post(
				'?op=user.activate', { key: key, uid: uid },
				function(result)
				{
					if(result.error)
					{
						displayError(
							lang.act.err.header,
							result.error.exception_class === 'InputFilterException' ?
								lang.act.err.link : result.error.message
						);
						return;
					}

					if(result === 0)
					{
						Iridium.UrlData.removeAll();
						loadPage('login');
					}
				},
				Iridium.Net.DataType.JSON,
				function(type, data) { console.error(type + ' ' + data); }
			)
		});

	}
};