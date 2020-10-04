
pagesLoadData.addresses = {
	link: '?page=part.wallet.addresses',
	onLoad: function(data)
	{
		Iridium.Init.launch(content);

		var addrsContainer = document.getElementById('addrs-container'),
			addressesList = new Iridium.DataList({
				url: '?op=wallet.address.list',
				postData: { full: 1 },
				onLoad: function(addresses)
				{
					while(addrsContainer.childNodes.length)
					{
						addrsContainer.removeChild(addrsContainer.childNodes[0]);
					}

					document.getElementById('addresses-num').innerHTML = addresses.length + '/' + pageData.maxAddresses;

					addresses.forEach(function(addr)
					{
						var controlElements = new Iridium.Builder({
							class: 'mt-10',
							childs: [
								{
									class: 'addr-btns text-right',
									childs: [{
										tag: 'button',
										class: 'btn btn-small',
										childs: [
											{
												tag: 'span',
												html: lang.edit
											},
											{
												class: 'btn-icon-separator'
											},
											getLoadedIcon('edit', 'btn-icon')
										],
										on: {
											click: function(e)
											{
												e.preventDefault();

												var addrEditPupup = new Iridium.Popup({
													header: lang.addr.edit.header,
													content: new Iridium.Builder({
														tag: 'form',
														id: 'addr-edit-form',
														action: '?op=wallet.address.update',
														childs: [
															{
																class: 'input-group',
																childs: [
																	{
																		tag: 'label',
																		class: 'input-label',
																		for: 'label-field',
																		html: lang.addr.label + ':'
																	},
																	{
																		class: 'input-field-icon-layout fill-width',
																		childs: [
																			{
																				tag: 'input',
																				type: 'text',
																				class: 'input-field fill-width',
																				name: 'label',
																				id: 'label-field',
																				value: addr.label,
																				placeholder: lang.addr.labelPl
																			},
																			{
																				class: 'input-field-icon-cnt',
																				childs: [getLoadedIcon('label', 'input-field-icon')]
																			}
																		]
																	}
																]
															},
															{
																class: 'input-group',
																childs: [
																	{
																		tag: 'input',
																		type: 'checkbox',
																		name: 'hidden',
																		class: 'input-checkbox',
																		id: 'hidden-checkbox',
																		value: '1',
																		checked: !!addr.hidden
																	},
																	{
																		tag: 'label',
																		for: 'hidden-checkbox',
																		class: 'input-label',
																		childs: [{
																			tag: 'span',
																			html: lang.addr.hidden
																		}]
																	}
																]
															},
															{
																class: 'mt-10 text-right',
																childs: [{
																	tag: 'button',
																	type: 'submit',
																	class: 'btn',
																	html: lang.save
																}]
															}
														],
														on: {
															submit: function(e)
															{
																e.preventDefault();

																Iridium.Net.post(
																	this.getAttribute('action'),
																	Iridium.merge(getFormData(this), {address: addr.address}),
																	function(result)
																	{
																		addrEditPupup.remove();

																		if(result.error)
																		{
																			console.error(result.error);
																			displayError(lang.addr.edit.errHeader, '<p>' + result.error.message + '</p>');
																			return;
																		}

																		addressesList.load();
																	}
																);
															}
														}
													}).build(),
													closeButton: true,
													closeButtonContent: getLoadedIcon('cross')
												}).show();
											}
										}
									}]
								}
							]
						}).build();

						addrsContainer.appendChild(createAddressRow(addr, controlElements));
					});
				}
			});

		addressesList.load();

		// Кнопка создания адреса
		document.getElementById('create-address-btn').addEventListener('click', function(e)
		{
			e.preventDefault();

			new Iridium.Popup({
				header: lang.addr.new.header,
				content: lang.addr.new.text,
				closeButton: true,
				closeButtonContent: getLoadedIcon('cross'),
				buttonsClass: 'btn btn-small',
				buttons: [
					{ content: lang.no },
					{
						content: lang.yes,
						action: function()
						{
							Iridium.Net.post('?op=wallet.address.create', null, function(result)
							{
								if(result.error)
								{
									displayError(lang.addr.new.errHeader, result.error.message);
								}

								addressesList.load();
							});
						}
					}
				]
			}).show();
		});

		var bookContainer = document.getElementById('book-container'),
			bookList = new Iridium.DataList({
				url: '?op=wallet.abook.list',
				onLoad: function(list)
				{
					while(bookContainer.childNodes.length)
					{
						bookContainer.removeChild(bookContainer.childNodes[0]);
					}

					list.forEach(function(addr)
					{
						var addrStruct = {
							class: 'addr',
							childs: [{
								class: 'addr-inf',
								childs: [{
									tag: 'span',
									html: addr.address,
									class: addr.hidden ? 'addr-hidden' : ''
								}]
							}]
						};

						if(addr.label)
						{
							addrStruct.childs.push({
								class: 'mt-10',
								childs: [{
									tag: 'span',
									class: 'childs-v-middle',
									childs: [
										getLoadedIcon('label', 'label-icon'),
										{
											tag: 'small',
											class: 'ml-5',
											html: addr.label
										}
									]
								}]
							});
						}

						addrStruct.childs.push({
							class: 'mt-10 ',
							childs: [{
								class: 'text-right addr-btns',
								childs: [
									{
										tag: 'button',
										class: 'btn btn-small',
										childs: [
											{ tag: 'span', html: lang.del },
											{ class: 'btn-icon-separator' },
											getLoadedIcon('trash', 'btn-icon')
										],
										on: {
											click: function(e)
											{
												e.preventDefault();

												new Iridium.Popup({
													header: lang.addr.book.del.header,
													content: lang.addr.book.del.text,
													closeButton: true,
													closeButtonContent: getLoadedIcon('cross'),
													buttonsClass: 'btn btn-small',
													buttons: [
														{ content: lang.no },
														{
															content: lang.yes,
															action: function()
															{
																Iridium.Net.post(
																	'?op=wallet.abook.delete',
																	{ id: addr.id },
																	function(result)
																	{
																		if(result.error)
																		{
																			console.error(result.error);
																			displayError(
																				lang.addr.book.del.errHeader,
																				result.error.message
																			);
																		}

																		bookList.load();
																	}
																);
															}
														}
													]
												}).show();
											}
										}
									},
									{
										tag: 'button',
										class: 'btn btn-small',
										childs: [
											{ tag: 'span', html: lang.edit },
											{ class: 'btn-icon-separator' },
											getLoadedIcon('edit', 'btn-icon')
										],
										on: {
											click: function(e)
											{
												e.preventDefault();

												var editBookAddrPopup = new Iridium.Popup({
													header: lang.addr.edit.header,
													content: new Iridium.Builder({
														tag: 'form',
														id: 'add-book-addr-form',
														action: '?op=wallet.abook.update',
														childs: [
															{
																class: 'input-group',
																childs: [
																	{
																		tag: 'label',
																		class: 'input-label',
																		for: 'label-field',
																		html: lang.addr.label + ':'
																	},
																	{
																		class: 'input-field-icon-layout fill-width',
																		childs: [
																			{
																				tag: 'input',
																				type: 'text',
																				class: 'input-field fill-width',
																				name: 'label',
																				id: 'label-field',
																				placeholder: lang.addr.labelPl,
																				value: addr.label
																			},
																			{
																				class: 'input-field-icon-cnt',
																				childs: [getLoadedIcon('label', 'input-field-icon')]
																			}
																		]
																	}
																]
															},
															{
																class: 'mt-20 text-right',
																childs: [{
																	tag: 'button',
																	type: 'submit',
																	class: 'btn',
																	html: lang.save
																}]
															}
														],
														on: {
															submit: function(e)
															{
																e.preventDefault();

																Iridium.Net.post(
																	this.getAttribute('action'),
																	Iridium.merge(getFormData(this), {id: addr.id}),
																	function(result)
																	{
																		editBookAddrPopup.remove();

																		if(result.error)
																		{
																			console.error(result.error);
																			displayError(lang.addr.edit.errHeader, '<p>' + result.error.message + '</p>');
																			return;
																		}

																		bookList.load();
																	}
																);
															}
														}
													}).build(),
													closeButton: true,
													closeButtonContent: getLoadedIcon('cross')
												}).show();
											}
										}
									}
								]
							}]
						});

						bookContainer.appendChild(new Iridium.Builder(addrStruct).build());
					});
				}
			});

		bookList.load();

		//Кнопка добавления адреса в адресную книгу
		document.getElementById('add-addr-book-btn').addEventListener('click', function(e)
		{
			e.preventDefault();

			var addBookAddrPopup = new Iridium.Popup({
				header: lang.addr.book.add.header,
				content: new Iridium.Builder({
					tag: 'form',
					id: 'add-book-addr-form',
					action: '?op=wallet.abook.add',
					childs: [
						{
							class: 'input-group',
							childs: [
								{
									tag: 'label',
									class: 'input-label',
									for: 'address-field',
									html: lang.addr.addr + ':'
								},
								{
									class: 'input-field-icon-layout fill-width',
									childs: [
										{
											tag: 'input',
											type: 'text',
											class: 'input-field fill-width',
											name: 'address',
											id: 'address-field',
											placeholder: lang.addr.book.add.addrPl,
											pattern: data.addressRegex,
											bool: 'required'
										},
										{
											class: 'input-field-icon-cnt',
											childs: [getLoadedIcon('user', 'input-field-icon')]
										}
									]
								}
							]
						},
						{
							class: 'input-group',
							childs: [
								{
									tag: 'label',
									class: 'input-label',
									for: 'label-field',
									html: lang.addr.label + ':'
								},
								{
									class: 'input-field-icon-layout fill-width',
									childs: [
										{
											tag: 'input',
											type: 'text',
											class: 'input-field fill-width',
											name: 'label',
											id: 'label-field',
											placeholder: lang.addr.labelPl
										},
										{
											class: 'input-field-icon-cnt',
											childs: [ getLoadedIcon('label', 'input-field-icon') ]
										}
									]
								}
							]
						},
						{
							class: 'mt-20 text-right',
							childs: [{
								tag: 'button',
								type: 'submit',
								class: 'btn',
								html: lang.add
							}]
						}
					],
					on: {
						submit: function(e)
						{
							e.preventDefault();

							Iridium.Net.post(
								this.getAttribute('action'),
								getFormData(this),
								function(result)
								{
									addBookAddrPopup.remove();

									if(result.error)
									{
										console.error(result.error);
										displayError(lang.addr.book.add.errHeader, '<p>' + result.error.message + '</p>');
										return;
									}

									bookList.load();
								}
							);
						}
					}
				}).build(),
				closeButton: true,
				closeButtonContent: getLoadedIcon('cross')
			}).show();
		});
	}
};