/**
 * Frontend main file.
 * @author rayleigh <rayleigh@protonmail.com>
 * @copyright 2018 Vladislav Pashaiev
 */


//=require iridium.js
//=require menu.js
//=require common.js
//=require components/captcha.js
//=require components/cookie.js


var content = document.getElementById('content'),
	/**
	 * Pages data for the loading.
	 * @todo Make component for the page loading control.
	 */
	pagesLoadData = {},
	currentPage,
	loggedIn,
	/**
	 * Время последнего действия от пользователя.
	 * Включает движение курсора и нажатие клавиши.
	 */
	lastActionTime = getTimestamp(),
	lockLayout,
	/**
	 * @namespace
	 * @property {number} raw Количество всех монет.
	 * @property {number} confirmed Количество кодтверждённых монет.
	 * @property {number} mature Количество зрелых монет.
	 */
	balance,
	/**
	 * Фразы текущего языка.
	 * @namespace
	 */
	lang;

//=require pages/login.js
//=require pages/register.js
//=require pages/activation.js
//=require pages/reset_pass.js
//=require pages/reset_pass_request.js

//=require pages/main.js
//=require pages/addresses.js
//=require pages/transactions.js
//=require pages/options.js
//=require pages/change_email.js

//=require pages/info.js
//=require pages/changelog.js

/**
 * Данные, получаемые при загрузке страницы.
 * @external pageData
 * @namespace
 * @property {boolean} pageData.loggedIn Выполнен ли вход.
 * @property {number} pageData.feeAmount Комиссия за транзакции.
 * @property {number} pageData.maxAddresses Максимальное количество адресов, которое может иметь пользователь.
 * @property {boolean} pageData.lock Заблокирован ли кошелёк.
 * @property {boolean} pageData.hasPin Задан ли PIN у пользователя.
 * @property {int} pageData.autolockTimeout Таймаут автоблокировки кошелька.
 * @property {string} pageData.iridiumVersion Версия Iridium Core.
 * @property {object} pageData.lang Various data of the current language.
 * @property {string} pageData.lang.imprint Imprint of the current language cache.
 * @property {string} pageData.lang.imprintCookie Cookie name for the language imprint.
 * @property {boolean} pageData.lang.cache True, if the caching is enabled.
 * @property {object} pageData.lang.data Dictionary of the current language.
 */

/**
 * Loads partial page.
 * @param name Name of the page from pagesLoadData.
 * @param {boolean} [reload=false] Перезагрузить страницу, если она совпадает с текущей.
 * @see pagesLoadData
 */
function loadPage(name, reload)
{
	function setActiveLink()
	{
		var partPageLinks = document.body.querySelectorAll('[data-part-link]');
		for(var i = 0; i < partPageLinks.length; i++)
		{
			var link     = partPageLinks[i],
				pageName = link.dataset.partLink;

			if(pageName === name
				&& (!link.dataset.plTabs || link.dataset.plTabs && link.dataset.plTabNum && Iridium.UrlData.has(link.dataset.plTabs)
				&& Iridium.UrlData.get(link.dataset.plTabs) == link.dataset.plTabNum)
			)
			{
				Iridium.addClass(link, 'active');
			}
			else
			{
				Iridium.removeClass(link, 'active');
			}
		}
	}

	if(!reload && name === currentPage)
	{
		Iridium.Tabs.update();
		setActiveLink();
		return;
	}

	if(!(content && pagesLoadData)) { return; }

	if(!pagesLoadData[name])
	{
		displayError(lang.page.noPage.header, '<p>' + String.format(lang.page.noPage.text, name) + '</p>');
		return;
	}

	Iridium.Net.get(
		pagesLoadData[name].link,
		null,
		function(data)
		{
			if(data.error)
			{
				var err = data.error;
				console.error(err);

				if(err.exception_class === 'RestrictionException')
				{
					displayError(
						lang.page.loadErr.header,
						'<p>' + String.format(lang.page.loadErr.text, name) + '</p><p>' + err.message + '</p>'
					);
				}

				return;
			}

			setActiveLink();

			new Iridium.Animation({
				element: content,
				animation: 'fadeOut',
				duration: 150,
				onStop: function()
				{
					if(data.title)
					{
						document.title = data.title;
					}

					content.innerHTML = data.content;

					new Iridium.Animation({
						element: content,
						animation: 'fadeIn',
						duration: 150
					});

					if(currentPage && typeof pagesLoadData[currentPage].onClose === 'function')
					{
						pagesLoadData[currentPage].onClose();
					}

					currentPage = name;

					if(typeof pagesLoadData[name].onLoad === 'function')
					{
						pagesLoadData[name].onLoad(data.data);
					}

					Iridium.UrlData.set('part', name);
				}
			});
		},
		Iridium.Net.DataType.JSON,
		function(type, data)
		{
			console.error(type);
			console.error(data);
			displayError(lang.page.httpErr.header, '<p>' + lang.page.loadErr.text + '</p>');
		});
}

// Ссылки на частичные страницы
Iridium.Init.register('part-links', function(element)
{
	var partPageLinks = element.querySelectorAll('[data-part-link]');

	for(var i = 0; i < partPageLinks.length; i++)
	{
		var link         = partPageLinks[i],
			pageName     = link.dataset.partLink,
			authPageName = link.dataset.partLinkAuth,
			tabs         = link.dataset.plTabs,
			tabNum       = link.dataset.plTabNum;

		if(pageName)
		{
			link.href = '#part=' + pageName;

			if(tabs && tabNum)
			{
				link.href += '&' + tabs + '=' + tabNum;
			}

			link.addEventListener('click', function(e)
			{
				e.preventDefault();
				Menu.hide();

				if(this.tabs && this.tabNum)
				{
					Iridium.UrlData.set(this.tabs, this.tabNum);
				}

				loadPage(loggedIn && this.authName ? this.authName.valueOf() : this.name.valueOf());
			}.bind({ name: pageName, authName: authPageName, tabs: tabs, tabNum: tabNum}));
		}
	}
});

function updateLayout()
{
	var loginNav  = document.getElementById('login-nav'),
		walletNav = document.getElementById('wallet-nav-menu');

	if(loggedIn)
	{
		loginNav.style.display  = 'none';
		walletNav.style.display = '';
		Menu.setElement(walletNav);
		Iridium.addClass(document.body, 'wallet');
	}
	else
	{
		walletNav.style.display = 'none';
		loginNav.style.display  = '';
		Menu.setElement(loginNav);
		Iridium.removeClass(document.body, 'wallet');
	}
}

/**
 * Открывает диалоговое окно с предложением выйти.
 */
function exit(successCallback)
{
	new Iridium.Popup({
		header: lang.exit.exit,
		content: '<p>' + lang.exit.question + '</p>',
		closeButton: true,
		closeButtonContent: getLoadedIcon('cross'),
		buttonsClass: 'btn btn-small',
		buttons: [
			{ content: lang.no },
			{
				content: lang.yes,
				action: function()
				{
					Iridium.Net.post('?op=user.exit', null, function(result)
					{
						if(result.error)
						{
							displayError(lang.error, '<p>' + result.error.message + '</p>');
							return;
						}

						if(result === 0)
						{
							if(typeof successCallback === 'function')
							{
								successCallback();
							}

							loadPage('login');
							loggedIn = false;
							updateLayout();
						}
					});
				}
			}
		]
	}).show();
}


function displayLockLayout(usePass)
{
	if(lockLayout) { return; }

	Iridium.addClass(document.body, 'overlay');

	var layoutStruct = {
		class: 'lock-overlay',
		childs: [
			getLoadedIcon('lock', 'wallet-lock-icon'),
			{
				tag: 'h2',
				html: lang.lock.heading
			}
		]
	};

	// usePass = true - разблокировка по паролю
	// usePass = false - разблокировка по PIN
	// Разблокировка по PIN применяется в случае, если пользователь его задал в параметрах

	var fieldStruct;

	if(usePass)
	{
		fieldStruct = {
			class: 'input-field-icon-layout fill-width',
			childs: [
				{
					tag: 'input',
					type: 'password',
					class: 'input-field fill-width',
					id: 'unlock-field',
					placeholder: lang.lock.passPl
				},
				{
					class: 'input-field-icon-cnt',
					childs: [ getLoadedIcon('lock', 'input-field-icon') ]
				}
			]
		};
	}
	else
	{
		fieldStruct = {
			tag: 'input',
			type: 'password',
			placeholder: '_  _  _  _',
			id: 'unlock-field',
			class: 'input-field',
			size: 4,
			maxlength: 4
		};
	}

	layoutStruct.childs.push(
		{
			tag: 'p',
			class: 'mt-40',
			html: lang.lock.forUnlock + ' ' + (usePass ? lang.user.passL : lang.pin.pin) + ':'
		},
		{
			class: 'input-group mt-10',
			childs: [{
				class: 'input-group-horizontal',
				childs: [
					fieldStruct,
					{
						tag: 'button',
						class: 'btn only-icon ml-10',
						childs: [ getLoadedIcon('chevron-right', 'btn-icon')],
						on: {
							click: function()
							{
								unlockWallet(usePass, document.getElementById('unlock-field').value);
							}
						}
					}
				]
			}]
		},
		{
			tag: 'p',
			class: 'mt-20',
			html: lang.lock.orExit + ':'
		},
		{
			tag: 'button',
			class: 'btn mt-10',
			childs: [
				{ tag: 'span', html: lang.exit.exit },
				{ class: 'btn-icon-separator' },
				getLoadedIcon('exit', 'btn-icon')
			],
			on: { click: function() { exit(removeLockLayout); } }
		}
	);

	lockLayout = new Iridium.Builder(layoutStruct).build();
	document.body.appendChild(lockLayout);
}

function removeLockLayout()
{
	Iridium.removeClass(document.body, 'overlay');
	if(lockLayout)
	{
		document.body.removeChild(lockLayout);
		lockLayout = null;
	}
}

function lockWallet()
{
	Iridium.Net.post('?op=wallet.lock', null, function(result)
	{
		if(result.error)
		{
			displayError(
				lang.lock.err.lockHeader,
				'<p>' + lang.lock.err.lockText + '</p><p>' + result.error.message + '</p>'
			);

			return;
		}

		Iridium.Popup.closeAll();
		displayLockLayout(result);
	});
}

function unlockWallet(passUnlock, value)
{
	var data = passUnlock ? { pass: value } : { pin: value };

	Iridium.Net.post('?op=wallet.unlock', data, function(result)
	{
		if(result.error)
		{
			displayError(
				lang.lock.err.unlockHeader,
				'<p>' + lang.lock.err.unlockText + '</p><p>' + result.error.message + '</p>'
			);

			return;
		}

		if(result === 0) { removeLockLayout(); }
	});
}

// Предзагрузка SVG иконок
[
	'cross', 'address-book', 'wallet-from', 'wallet-to',
	'user', 'uni', 'label', 'eye', 'eye-off', 'edit',
	'trash', 'chevron-down', 'lock', 'chevron-right',
	'exit'
].forEach(function(name) { Iridium.SVG.loadFromURL('/img/icons/' + name + '.svg'); });

// Действия при загрузке страницы
window.addEventListener('load', function()
{
	console.log('Iridium Core version: ' + pageData.iridiumVersion);
	console.log('Iridium Framework version: ' + Iridium.version);

	loggedIn = pageData.loggedIn;

	var langCacheKey = 'lang_cache';

	if(pageData.lang.data)
	{
		lang = pageData.lang.data;

		if(pageData.lang.cache)
		{
			// Save the cache to the local storage
			localStorage.setItem(langCacheKey, JSON.stringify(pageData.lang.data));

			// Set the language imprint
			Cookie.set(pageData.lang.imprintCookie, pageData.lang.imprint, {
				expires: 2592000 // 30 days
			});
		}
		else
		{
			// Remove language cache and imprint because caching is disabled
			localStorage.removeItem(langCacheKey);
			Cookie.remove(pageData.lang.imprintCookie);
		}
	}
	else
	{
		var strLangData = localStorage.getItem(langCacheKey);

		// If something wrong with the cache and there is imprint of the cache
		if(!strLangData && !!Cookie.get(langCacheKey))
		{
			// Remove language cache imprint and reload the page
			Cookie.remove(pageData.lang.imprintCookie);
			location.reload(true);
		}

		// We assume that data is correct
		lang = JSON.parse(strLangData);
	}

	updateLayout();
	loadPage(Iridium.UrlData.get('part') || (loggedIn ? 'main' : 'login'));

	// Обновление баланса раз в минуту
	(function upd()
	{
		if(!loggedIn)
		{
			setTimeout(upd, 60000);
			return;
		}

		updateBalance();
		setTimeout(upd, 60000);
	})();

	// Кнопка скрытия/отображения меню
	document.getElementById('nav-btn').addEventListener('click', function(e)
	{
		e.preventDefault();
		Menu.toggle();
	});

	var navActions = document.getElementById('nav-actions'),
		navOpened  = false;

	// Кнопка скрытия/отображения действий (actions)
	document.getElementById('act-btn').addEventListener('click', function(e)
	{
		e.preventDefault();
		e.stopPropagation();

		Iridium.toggleClass(navActions, 'mob-hidden');

		if(!Iridium.hasClass(navActions, 'mob-hidden'))
		{
			navOpened = true;
		}
	});

	window.addEventListener('click', function()
	{
		if(navOpened)
		{
			Iridium.addClass(navActions, 'mob-hidden');
			navOpened = false;
		}
	});

	// Кнопка открытия окна отправки средств
	document.getElementById('send-btn').addEventListener('click', function(e)
	{
		e.preventDefault();

		var addressList = new Iridium.DataList({url: '?op=wallet.abook.list'}),
			addressCb   = new Iridium.Combobox({
				data: addressList,
				mapElementValue: function(e) { return e.address; },
				mapElementView: function(e) { return e.address; }
			}),
			loadFeeTimeoutid;

		addressCb.placeholder            = lang.trans.send.addressPl;
		addressCb.name                   = 'address';
		addressCb.className              = 'fill-width';
		addressCb.inputElement.className = 'fill-width';

		var usrIco = getLoadedIcon('user', 'input-field-icon'),
			uniIco = getLoadedIcon('uni', 'input-field-icon'),
			wfIco  = getLoadedIcon('wallet-from', 'btn-icon send-button-icon'),
			abIco  = getLoadedIcon('address-book', 'btn-icon');

		var sendPopup = new Iridium.Popup({
			windowClass: 'send-window',
			closeButton: true,
			closeButtonContent: getLoadedIcon('cross'),
			header: lang.trans.send.header,
			content: new Iridium.Builder({
				tag: 'form',
				action: '?op=wallet.transaction.send',
				id: 'send-form',
				childs: [
					{
						class: 'input-group',
						childs: [{
							class: 'input-group-horizontal',
							childs: [
								{
									class: 'input-field-icon-layout fill-width',
									childs: [
										addressCb,
										{
											class: 'input-field-icon-cnt',
											childs: [usrIco]
										}
									]
								},
								{
									// Кнопка открытия окна выбора адреса из адресной книги
									tag: 'button',
									class: 'btn only-icon ml-15',
									childs: [abIco],
									on: {
										click: function(e)
										{
											e.preventDefault();

											var listStruct = { class: 'addr-sel-list', childs: [] };

											addressList.list.forEach(function(address)
											{
												listStruct.childs.push({
													html: address.address,
													on: {
														click: function(e)
														{
															e.preventDefault();
															addressCb.value = this.innerHTML;
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
										}
									}
								}
							]
						}]
					},
					{
						class: 'input-group',
						childs: [{
							class: 'input-field-icon-layout fill-width',
							childs: [
								{
									tag: 'input',
									type: 'number',
									name: 'amount',
									id: 'send-amount-field',
									class: 'input-field fill-width',
									min: 0,
									step: 0.00000001,
									placeholder: lang.trans.send.amountPl,
									on: {
										// Обновление комиссии
										input: function()
										{
											if(loadFeeTimeoutid) { clearTimeout(loadFeeTimeoutid); }

											var val = parseFloat(document.getElementById('send-amount-field').value);
											if(!!val && val > 0)
											{
												loadFeeTimeoutid = setTimeout(function()
												{
													Iridium.Net.post(
														'?op=wallet.transaction.calcFee',
														{ amount: val },
														function(result)
														{
															var errorElement      = document.getElementById('amount-error'),
																feeAmountElement  = document.getElementById('fee-amount'),
																leftAmountElement = document.getElementById('left-amount');

															if(result.error)
															{
																console.error(result.error);
																errorElement.innerHTML      = result.error.message;
																leftAmountElement.innerHTML = getUniAmount(0);
																feeAmountElement.innerHTML  = getUniAmount(pageData.feeAmount);
																return;
															}

															errorElement.innerHTML      = '';
															feeAmountElement.innerHTML  = getUniAmount(result);
															leftAmountElement.innerHTML = getUniAmount(balance.mature - result - val);
														});
												}, 700);
											}
										}
									}
								},
								{
									class: 'input-field-icon-cnt',
									childs: [uniIco]
								}
							]
						}]
					},
					{ tag: 'hr' },
					{
						childs: [
							{
								childs: [{
									tag: 'small',
									childs: [
										{
											tag: 'span',
											html: lang.trans.send.available + ': '
										},
										{
											tag: 'span',
											id: 'available-amount',
											class: 'text-mono ml-5',
											html: getUniAmount(balance.mature)
										}
									]
								}]
							},
							{
								class: 'mt-15',
								childs: [{
									tag: 'small',
									childs: [
										{
											tag: 'span',
											html: lang.trans.send.fee + ': '
										},
										{
											tag: 'span',
											id: 'fee-amount',
											class: 'text-mono ml-5',
											html: getUniAmount(pageData.feeAmount)
										}
									]
								}]
							},
							{
								class: 'mt-15',
								childs: [{
									tag: 'small',
									childs: [
										{
											tag: 'span',
											html: lang.trans.send.left + ': '
										},
										{
											tag: 'span',
											id: 'left-amount',
											class: 'text-mono ml-5',
											html: getUniAmount(balance.mature)
										}
									]
								}]
							}
						]
					},
					{
						class: 'mt-15',
						childs: [{
							tag: 'span',
							class: 'text-error',
							id: 'amount-error'
						}]
					},
					{ tag: 'hr' },
					{
						class: 'mt-20 text-right',
						childs: [{
							tag: 'button',
							type: 'submit',
							class: 'btn',
							childs: [
								{ tag: 'span', html: lang.send },
								{ class: 'btn-icon-separator' },
								wfIco
							]
						}]
					}
				],
				on: {
					submit: function(e)
					{
						e.preventDefault();
						sendPopup.remove();

						function sendRequest(data)
						{
							Iridium.Net.post(this.getAttribute('action'), data, function(result)
							{
								if(result.error)
								{
									console.error(result.error);
									displayError(
										lang.trans.send.errHeader,
										'<p>'
											+ (result.error.exception_class === 'InputFilterException' ?
												lang.trans.send.errData : result.error.message)
											+ '</p>'
									);
									return;
								}

								updateBalance();

								new Iridium.Popup({
									header: lang.trans.send.header,
									content: '<p>' + lang.trans.send.successText + '</p>',
									windowClass: 'window-success',
									buttons: [{ content: lang.ok }],
									buttonsClass: 'btn btn-small',
									closeButton: true,
									closeButtonContent: getLoadedIcon('cross')
								}).show();
							});
						}

						var formData = getFormData(this);

						if(pageData.hasPin)
						{
							new Iridium.Popup({
								header: lang.trans.send.confirmHeader,
								content: new Iridium.Builder({
									class: 'input-group',
									childs: [
										{
											tag: 'label',
											for: 'pin-field',
											html: lang.trans.send.confirmText + ':',
											class: 'input-label'
										},
										{
											tag: 'input',
											type: 'password',
											placeholder: '_  _  _  _',
											id: 'pin-field',
											class: 'input-field',
											size: 4,
											maxlength: 4
										}
									]
								}).build(),
								closeButton: true,
								closeButtonContent: getLoadedIcon('cross'),
								buttonsClass: 'btn',
								buttons: [
									{ content: lang.cancel },
									{
										content: lang.confirm,
										action: function()
										{
											formData.pin = document.getElementById('pin-field').value;
											sendRequest(formData);
										}
									}
								]
							}).show();
						}
						else
						{
							sendRequest(formData);
						}
					}
				}
			}).build()
		}).show();
	});

	// Кнопка бокировки кошелька
	document.getElementById('lock-btn').addEventListener('click', function(e)
	{
		e.preventDefault();
		lockWallet();
	});

	// Кнопка выхода
	document.getElementById('exit-btn').addEventListener('click', function(e)
	{
		e.preventDefault();
		exit();
	});

	// Кнопка изменения текущего языка
	document.getElementById('lang-btn').addEventListener('click', function(e)
	{
		e.preventDefault();

		// Combobox for the language select
		var langDataList = new Iridium.DataList({
				url: '?op=lang.list',
				onLoad: function(list)
				{
					list.forEach(function(l)
					{
						if(l.code === pageData.lang.current)
						{
							langCombobox.value = l.name;
						}
					});
				}
			}),
			langCombobox = new Iridium.Combobox({
				data: langDataList,
				mapElementValue: function(e) { return e.code; },
				mapElementView: function(e) { return e.name; },
				hintsNumber: 0,
				strict: true,
				select: true,
				button: true,
				buttonContent: getLoadedIcon('chevron-down')
			});

		langCombobox.className = 'select';

		(new Iridium.Popup({
			header: lang.lang.header,
			content: (new Iridium.Builder({
				tag: 'form',
				action: '?op=lang.set',
				childs: [
					{
						class: 'input-group',
						childs: [
							{
								tag: 'label',
								class: 'input-label',
								html: lang.lang.label + ':'
							},
							langCombobox
						]
					}
				]
			})).build(),
			closeButton: true,
			closeButtonContent: getLoadedIcon('cross'),
			buttonsClass: 'btn',
			buttons: [
				{
					content: lang.save,
					action: function()
					{
						Iridium.Net.post('?op=lang.set', {code: langCombobox.value}, function(result)
						{
							if(result.error)
							{
								displayError(lang.error, '<p>' + result.error.message + '</p>');
								return;
							}

							if(result === 0)
							{
								location.reload();
							}
						});
					}
				}
			]
		})).show();
	});

	// Кошелёк заблокировн
	if(pageData.lock)
	{
		setTimeout(function() { displayLockLayout(!pageData.hasPin); }, 100);
	}

	// Автоблокировка кошелька по таймауту
	setTimeout(function autolockDetect()
	{
		if(loggedIn && !lockLayout && pageData.autolockTimeout > 0 && lastActionTime + pageData.autolockTimeout < getTimestamp())
		{
			lockWallet();
		}

		setTimeout(autolockDetect, 1000);
	}, 1000);
});

// Запоминаем время последнего действия

document.addEventListener('mousemove', function()
{
	lastActionTime = getTimestamp();
});

document.addEventListener('keydown', function()
{
	lastActionTime = getTimestamp();
});