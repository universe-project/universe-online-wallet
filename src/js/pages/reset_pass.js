/**
 * Страница изменения пароля.
 */
pagesLoadData.resetPass = {
	link: '?page=part.resetPassword',
	onLoad: function()
	{
		Iridium.Init.launch(content);

		document.getElementById('reset-pass-form').addEventListener('submit', function(e)
		{
			e.preventDefault();
			var key = Iridium.UrlData.get('key'), uid = Iridium.UrlData.get('uid');

			Iridium.Net.post(
				this.getAttribute('action'),
				Iridium.merge(getFormData(this), { key: key, uid: uid }),
				function(result)
				{
					var header = lang.lostPwd.change;

					if(result.error)
					{
						displayError(
							header,
							result.error.exception_class === 'InputFilterException' ?
								lang.lostPwd.res.wrongData : result.error.message
						);
						return;
					}

					new Iridium.Popup({
						windowClass: 'window-success',
						header: header,
						content: '<p>' + lang.lostPwd.res.success + '</p>',
						closeButton: true,
						closeButtonContent: getLoadedIcon('cross'),
						buttonsClass: 'btn btn-small',
						buttons: [{ content: lang.ok }],
						onHide: function() { loadPage('login') }
					}).show();
				}
			);
		});
	}
};