/**
 * Страница отправления запроса на изменение пароля.
 */
pagesLoadData.resetPassRequest = {
	link: '?page=part.resetPasswordRequest',
	onLoad: function()
	{
		Iridium.Init.launch(content);

		Captcha.set(document.getElementById('captcha-img'), document.getElementById('captcha-bar'));
		Captcha.enable();

		document.getElementById('reset-pass-request-form').addEventListener('submit', function(e)
		{
			e.preventDefault();

			Iridium.Net.post(
				this.getAttribute('action'),
				Iridium.merge(getFormData(this), { captcha_hash: Captcha.getHash() }),
				function(result)
				{
					var header = lang.lostPwd.req.header;

					if(result.error)
					{
						var err = result.error;
						console.error(err);

						if(err.exception_class === 'InputFilterException')
						{
							if(err.specific.value_name === 'email')
							{ displayError(header, lang.lostPwd.req.emailReq); }
							else if(err.specific.value_name === 'captcha')
							{ displayError(header, lang.lostPwd.req.captchaReq); }
							return;
						}

						displayError(header, result.error.message);
						return;
					}

					new Iridium.Popup({
						header: header,
						content: '<p>'+ lang.lostPwd.req.successMsg + '</p>',
						closeButton: true,
						closeButtonContent: getLoadedIcon('cross'),
						buttonsClass: 'btn btn-small',
						buttons: [{ content: lang.ok }],
						onHide: function() { loadPage('login') }
					}).show();
				}
			);
		});
	},
	onClose: function() { Captcha.disable(); }
};