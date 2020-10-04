
pagesLoadData.transactions = {
	link: '?page=part.wallet.transactions',
	onLoad: function()
	{
		Iridium.Init.launch(content);

		var addressList     = new Iridium.DataList({
				url: '?op=wallet.address.list',
				postData: { hidden: 0 }
			}),
			addressCombobox = new Iridium.Combobox({
				data: addressList,
				strict: true,
				emptyInputHints: true,
				mapElementView: function(element) { return element; },
				mapElementValue: function(element) { return element; }
			});

		addressCombobox.className              = 'fill-width';
		addressCombobox.inputElement.className = 'fill-width';
		addressCombobox.inputElement.setAttribute('autocomplete', 'off');
		addressCombobox.inputElement.id = 'change-address-field';
		addressCombobox.placeholder     = lang.trans.ctrl.cbPl;

		var cbPlace = document.getElementById('address-cb-place');
		cbPlace.parentNode.replaceChild(addressCombobox, cbPlace);

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
						click: function(e)
						{
							e.preventDefault();
							addressCombobox.value = this.innerHTML;
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

		//Кнопка сброса поля адреса
		document.getElementById('reset-addr-btn').addEventListener('click', function(e)
		{
			e.preventDefault();
			addressCombobox.value = '';
		});

		var pagesText        = document.getElementById('pages-txt'),
			txsContainer     = document.getElementById('transactions-container'),
			transactionsList = new Iridium.DataList({
				url: '?op=wallet.transaction.list',
				pageNav: true,
				onLoad: function(result)
				{
					pagesText.innerHTML = (transactionsList.page + 1) + '/' + transactionsList.pages;

					// Удаляем предыдущие транзакции
					while(txsContainer.childNodes.length)
					{
						txsContainer.removeChild(txsContainer.childNodes[0]);
					}

					// Добавляем новые транзакции
					result.forEach(function(txData) { txsContainer.appendChild(createTransactionElement(txData)); });
				}
			});

		transactionsList.load();

		// Кнопка следующей страницы
		document.getElementById('prev-page-btn').addEventListener('click', function(e)
		{
			e.preventDefault();
			transactionsList.prevPage();
			transactionsList.load();
		});

		// Кнопка предыдущей страницы
		document.getElementById('next-page-btn').addEventListener('click', function(e)
		{
			e.preventDefault();
			transactionsList.nextPage();
			transactionsList.load();
		});

		var inCheckbox  = document.getElementById('in-chkbx'),
			outCheckbox = document.getElementById('out-chkbx');

		function changeDirection()
		{
			var direction = '';

			if(this === inCheckbox && inCheckbox.checked)
			{
				direction           = 'in';
				outCheckbox.checked = false;
			}
			else if(this === outCheckbox && outCheckbox.checked)
			{
				direction          = 'out';
				inCheckbox.checked = false;
			}

			transactionsList.updatePostData({dir: direction});
			transactionsList.load();
		}

		inCheckbox.addEventListener('change', changeDirection);
		outCheckbox.addEventListener('change', changeDirection);

		addressCombobox.addEventListener('input', function()
		{
			transactionsList.updatePostData({addr: addressCombobox.value});
			transactionsList.load();
		});
	}
};