// Страница настроек

pagesLoadData.options = {
	link: '?page=part.wallet.options',
	onLoad: function(data)
	{
		Iridium.Init.launch(content);

		var addressList    = new Iridium.DataList({
				url: '?op=wallet.address.list',
				postData: { hidden: 0 }
			}),
			changeCombobox = new Iridium.Combobox({
				data: addressList,
				strict: true,
				emptyInputHints: true,
				mapElementView: function(element) { return element; },
				mapElementValue: function(element) { return element; }
			});

		changeCombobox.name                   = 'change_address';
		changeCombobox.className              = 'fill-width';
		changeCombobox.inputElement.className = 'fill-width';
		changeCombobox.inputElement.setAttribute('autocomplete', 'off');
		changeCombobox.inputElement.id = 'change-address-field';
		changeCombobox.placeholder     = lang.options.change.pl;
		changeCombobox.value           = data.changeAddr;

		var cbPlace = document.getElementById('change-cb-place');
		cbPlace.parentNode.replaceChild(changeCombobox, cbPlace);

		// Кнопка отркытия списка адресов
		document.getElementById('addr-list-btn').addEventListener('click', function(e)
		{
			e.preventDefault();

			var listStruct = { class: 'addr-sel-list', childs: [] };

			addressList.list.forEach(function(address)
			{
				listStruct.childs.push({
					html: address,
					on: {
						click: function()
						{
							changeCombobox.value = this.innerHTML;
							addrPopup.remove();
						}
					}
				});
			});

			var addrPopup = new Iridium.Popup({
				header: lang.addr.select,
				content: new Iridium.Builder(listStruct).build(),
				buttonsClass: 'btn btn-small',
				buttons: [{ content: lang.close }]
			}).show();
		});

		//Кнопка сброса поля адреса для сдачи
		document.getElementById('reset-change-addr-btn').addEventListener('click', function(e)
		{
			e.preventDefault();
			changeCombobox.value = '';
		});

		// Данные комбобокса блокировки
		var lockData = [
			{ val: 0, txt: lang.options.lock.never },
			{ val: 1, txt: lang.options.lock.min5 },
			{ val: 2, txt: lang.options.lock.min10 },
			{ val: 3, txt: lang.options.lock.min15 },
			{ val: 4, txt: lang.options.lock.min30 }
		];

		var lockCombobox = new Iridium.Combobox({
			data: lockData,
			hintsNumber: 0,
			strict: true,
			select: true,
			button: true,
			buttonContent: getLoadedIcon('chevron-down'),
			mapElementView: function(element) { return element.txt; },
			mapElementValue: function(element) { return element.val; }
		});

		lockCombobox.name                   = 'lock_time';
		lockCombobox.className              = 'select fill-width';
		lockCombobox.inputElement.className = 'fill-width';

		for(var i = 0; i < lockData.length; i++)
		{
			var ld = lockData[i];
			if(ld.val === data.timeoutId)
			{
				lockCombobox.value = ld.txt;
				break;
			}
		}

		var lockCbPlace = document.getElementById('wallet-lock-cb-place');
		lockCbPlace.parentNode.replaceChild(lockCombobox, lockCbPlace);

		// Кнопка изменения e-mail адреса
		document.getElementById('change-email-btn').addEventListener('click', function(e)
		{
			e.preventDefault();

			var emailField = document.getElementById('email-field'),
				email = emailField.value;

			if(Iridium.empty(email))
			{
				displayFieldError(emailField);
				return;
			}

			new Iridium.Popup({
				header: lang.options.email.header,
				content: new Iridium.Builder({
					childs: [{
						class: 'input-group',
						childs: [
							{
								tag: 'label',
								class: 'input-label',
								html: lang.options.email.passLb + ':'
							},
							{
								class: 'input-field-icon-layout fill-width',
								childs: [
									{
										tag: 'input',
										type: 'password',
										class: 'input-field fill-width',
										name: 'pass',
										id: 'ec-pass-field',
										placeholder: lang.options.confPassPl
									},
									{
										class: 'input-field-icon-cnt',
										childs: [ getLoadedIcon('lock', 'input-field-icon') ]
									}
								]
							}
						]
					}]
				}).build(),
				closeButton: true,
				closeButtonContent: getLoadedIcon('cross'),
				windowClass: 'change-email-window',
				buttonsClass: 'btn',
				buttons: [{
					content: lang.change,
					action: function()
					{
						emailField.value = '';

						Iridium.Net.post(
							'?op=user.options.email',
							{
								email: email,
								pass: document.getElementById('ec-pass-field').value
							},
							function(result)
							{
								if(result.error)
								{
									displayError(
										lang.options.email.header,
										result.error.exception_class === 'InputFilterException'
											? lang.options.wrongData : result.error.message
									);

									return;
								}

								if(result === 0) // Необходимо подтверждение
								{
									new Iridium.Popup({
										header: lang.options.email.confReqHeader,
										content: '<p>' + lang.options.email.confReqDesc + '</p>',
										closeButton: true,
										closeButtonContent: getLoadedIcon('cross'),
										buttonsClass: 'btn btn-small',
										buttons: [{ content: lang.ok }]
									}).show();
								}
								else if(result === 1) // E-mail изменён
								{
									// Перезагружаем страницу
									// TODO: сообщение об успешном изменении пароля
									loadPage('options', true);
								}
							}
						)
					}
				}]
			}).show();
		});

		var passField       = document.getElementById('password-field'),
			repeatPassField = document.getElementById('password-repeat-field');

		// Кнопка изменения пароля
		document.getElementById('change-pass-btn').addEventListener('click', function(e)
		{
			e.preventDefault();

			var pass       = passField.value,
				repeatPass = repeatPassField.value,
				err        = false;

			if(Iridium.empty(pass))
			{
				displayFieldError(passField);
				err = true;
			}

			if(Iridium.empty(repeatPass))
			{
				displayFieldError(repeatPassField);
				err = true;
			}

			if(err) { return; }

			new Iridium.Popup({
				closeButton: true,
				closeButtonContent: getLoadedIcon('cross'),
				header: lang.options.pass.lb,
				content: new Iridium.Builder({
					childs: [{
						class: 'input-group',
						childs: [
							{
								tag: 'label',
								class: 'input-label',
								html: lang.options.pass.conf_lb + ':'
							},
							{
								class: 'input-field-icon-layout fill-width',
								childs: [
									{
										tag: 'input',
										type: 'password',
										class: 'input-field fill-width',
										name: 'pass',
										id: 'pc-pass-field',
										placeholder: lang.options.confPassPl
									},
									{
										class: 'input-field-icon-cnt',
										childs: [ getLoadedIcon('lock', 'input-field-icon') ]
									}
								]
							}
						]
					}]
				}).build(),
				buttonsClass: 'btn',
				buttons: [{
					content: lang.change,
					action: function()
					{
						passField.value       = '';
						repeatPassField.value = '';

						Iridium.Net.post(
							'?op=user.options.password',
							{
								pass: pass,
								repeat_pass: repeatPass,
								old_pass: document.getElementById('pc-pass-field').value
							},
							function(result)
							{
								if(result.error)
								{
									displayError(
										lang.options.pass.lb,
										result.error.exception_class === 'InputFilterException' ?
											lang.options.wrongData : result.error.message
									);

									return;
								}

								if(result === 0)
								{
									new Iridium.Popup({
										windowClass: 'window-success',
										header: lang.options.pass.lb,
										content: '<p>' + lang.options.pass.success + '</p>',
										buttonsClass: 'btn btn-small',
										buttons: [{ content: lang.ok }],
										closeButton: true,
										closeButtonContent: getLoadedIcon('cross')
									}).show();
								}
							}
						);
					}
				}]
			}).show();
		});

		var pinField = document.getElementById('pin-field');

		// Кнопка сброса PIN-кода
		document.getElementById('reset-pin').addEventListener('click', function(e)
		{
			e.preventDefault();
			pinField.value = '';
		});

		// Форма параметров
		document.getElementById('options-form').addEventListener('submit', function(e)
		{
			e.preventDefault();

			Iridium.Net.post(
				this.getAttribute('action'),
				getFormData(this),
				function(result)
				{
					if(result.error)
					{
						displayError(lang.options.paramsErrHeader, result.error.message);
						return;
					}

					if(result)
					{
						pageData.autolockTimeout = result.autolockTimeout;
						// Перезагружаем страницу
						loadPage('options', true);
					}
				}
			);
		});
	}
};