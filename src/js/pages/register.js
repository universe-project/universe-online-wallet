// Страница регистрации

pagesLoadData.register = {
	link: '?page=part.register',
	onLoad: function()
	{
		Iridium.Init.launch(content);

		Captcha.set(document.getElementById('captcha-img'), document.getElementById('captcha-bar'));
		Captcha.enable();

		document.getElementById('register-form').addEventListener('submit', function(e)
		{
			e.preventDefault();
			var _ = this;

			Iridium.Net.post(
				this.getAttribute('action'),
				Iridium.merge(getFormData(_), { captcha_hash: Captcha.getHash() }),
				function(result)
				{
					if(result.error)
					{
						var error = result.error;

						// Input filter error
						// Highlight the input field with error
						if(error.exception_class === 'InputFilterException')
						{
							displayFieldError(_.elements[error.specific.value_name]);
						}
						else if(error.exception_class === 'OperationException'
							|| (error.exception_class === 'RestrictionException'
								&& error.specific.restriction_class === 'CaptchaRestriction'))
						{
							var errorContainer       = document.getElementById('error-message');
							errorContainer.innerHTML = error.message;

							new Iridium.Animation({
								element: errorContainer,
								duration: 300,
								animation: 'fadeIn',
								onStop: function()
								{
									setTimeout(function()
									{
										new Iridium.Animation({
											element: errorContainer,
											duration: 300,
											animation: 'fadeOut',
											onStop: function() { errorContainer.innerHTML = ''; }
										})
									}, 2000);
								}
							});
						}
						else { displayError(lang.reg.reg, error.message); }
						return;
					}

					if(result === 0 || result === 1)
					{
						var content = '<p>' + lang.reg.success;
						if(result === 1) { content += ' ' + lang.reg.successEmail; }

						new Iridium.Popup({
							header: lang.reg.successHeader,
							content: content + '</p>',
							windowClass: 'window-success',
							closeButton: true,
							closeButtonContent: getLoadedIcon('cross'),
							onHide: function() { loadPage('login'); }
						}).show();
					}
				},
				Iridium.Net.DataType.JSON,
				function(type, data) { console.error(type + '' + data); }
			);
		});
	},
	onClose: function() { Captcha.disable(); }
};