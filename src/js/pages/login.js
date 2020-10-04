pagesLoadData.login = {
	link: '?page=part.login',
	onLoad: function()
	{
		Iridium.Init.launch(content);
		document.getElementById('login-form').addEventListener('submit', function(e)
		{
			e.preventDefault();
			Iridium.Net.post(
				this.getAttribute('action'),
				getFormData(this),
				function(result)
				{
					if(result.error)
					{
						var error          = result.error,
							errorContainer = document.getElementById('error-message');

						if(error.exception_class === 'OperationException')
						{
							errorContainer.innerHTML = '<p>' + error.message + '</p>';
						}
						else
						{
							errorContainer.innerHTML = 'Unknown error.';
							console.error(result.error);
						}

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

						return;
					}

					if(result)
					{
						document.getElementById('email-place').innerHTML = result.email;
						pageData.autolockTimeout                         = result.autolockTimeout;
						pageData.hasPin                                  = result.hasPin;
						loggedIn                                         = true;
						updateLayout();
						updateBalance();
						loadPage('main');
					}
				},
				Iridium.Net.DataType.JSON,
				function(type, data) { console.error(type + ' ' + data); }
			);
		});
	}
};