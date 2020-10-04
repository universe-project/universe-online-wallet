/**
 * Главная страница.
 */
pagesLoadData.main = {
	link: '?page=part.wallet.main',
	onLoad: function(data)
	{
		Iridium.Init.launch(content);
		document.getElementById('stats-upd-int').innerHTML = data.statsUpdTime;
		var statsUpdTime = data.statsUpdTime * 1000;

		(function updateStats()
		{
			if(currentPage !== 'main')
			{
				return;
			}
			
			Iridium.Net.post('?op=wallet.stats', null, function(result)
			{
				if(result.error)
				{
					console.error(result.error);
					return;
				}

				['balance', 'in', 'out'].forEach(function(e)
				{
					document.getElementById(e + '-amt').innerHTML = result[e].toFixed(8) + ' UNI';
				});

				var lastUpdInfElement       = document.getElementById('stats-last-upd');
				lastUpdInfElement.innerHTML = dateToHuman(result.machineTime);
				lastUpdInfElement.datetime  = result.machineTime;
			});
			
			setTimeout(updateStats, statsUpdTime);
		})();

		var addressesContainer = document.getElementById('addresses-container'),
			addressesList      = new Iridium.DataList({
				url: '?op=wallet.address.list',
				postData: {full: 1, hidden: 0},
				onLoad: function(list)
				{
					while(addressesContainer.childNodes.length)
					{
						addressesContainer.removeChild(addressesContainer.childNodes[0]);
					}

					list.forEach(function(addr) { addressesContainer.appendChild(createAddressRow(addr)); });
				}
			}),
			txsContainer = document.getElementById('transactions-container'),
			transactionsList = new Iridium.DataList({
				url: '?op=wallet.transaction.list',
				pageNav: true,
				postData: { num: 3 },
				onLoad: function(result)
				{
					// Удаляем предыдущие транзакции
					while(txsContainer.childNodes.length) { txsContainer.removeChild(txsContainer.childNodes[0]); }

					// Добавляем новые транзакции
					result.forEach(function(txData) { txsContainer.appendChild(createTransactionElement(txData)); });
				}
			});

		addressesList.load();
		transactionsList.load();
	}
};