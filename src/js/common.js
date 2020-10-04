/**
 * Создаёт элемент строки адреса.
 * @param {object} addr Данные адреса.
 * @param {HTMLElement} [controlElements] Элементы управления.
 */
function createAddressRow(addr, controlElements)
{
	var tagStruct = { class: 'mt-10 addr-tags', childs: [] };

	if(addr.label)
	{
		tagStruct.childs.push({
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
		});
	}

	tagStruct.childs.push({
		tag: 'span',
		class: 'childs-v-middle',
		childs: [
			getLoadedIcon(addr.hidden ? 'eye-off' : 'eye', 'label-icon'),
			{
				tag: 'small',
				class: 'ml-5',
				html: addr.hidden ? lang.addr.hidden : lang.addr.visible
			}
		]
	});

	var rowStruct = {
		class: 'addr',
		childs: [
			{
				class: 'addr-inf',
				childs: [
					{
						tag: 'span',
						html: addr.address,
						class: addr.hidden ? 'addr-hidden' : ''
					},
					{
						tag: 'span',
						class: 'text-mono mt-10 ml-sm-10 mt-sm-0',
						html: getUniAmount(addr.amount)
					}
				]
			},
			tagStruct
		]
	};

	if(controlElements)
	{
		rowStruct.childs.push(controlElements);
	}

	return new Iridium.Builder(rowStruct).build();
}

/**
 * Создаёт элемент для отображения информации о транзакции.
 * @param {object} txData
 */
function createTransactionElement(txData)
{
	var dataStruct = {
		class: 'ml-0 ml-sm-20',
		childs: [
			{
				class: 'tr-type',
				html: (txData.direction === 'in' ? lang.trans.in : lang.trans.out) + ' ' + lang.trans.trans
			},
			{
				class: 'mt-20',
				html: lang.trans.amount + ': <span class="text-mono">' + getUniAmount(txData.amount) + '</span>'
			}
		]
	};

	var addressStruct = {
		class: 'mt-15',
		childs: [{
			tag: 'span',
			html: lang.addr.addr + ': ' + txData.address
		}]
	};

	if(txData.addressLabel)
	{
		addressStruct.childs.push(
			{ tag: 'br' },
			{
				class: 'mt-10 childs-v-middle',
				childs: [
					getLoadedIcon('label', 'label-icon'),
					{
						tag: 'small',
						class: 'ml-5',
						html: txData.addressLabel
					}
				]
			}
		);
	}

	dataStruct.childs.push(addressStruct);

	if(txData.direction === 'in')
	{
		dataStruct.childs.push({
			class: 'mt-15',
			html: lang.trans.type + ': ' + (txData.generated ? lang.trans.mined : lang.trans.received)
		});
	}

	dataStruct.childs.push({
		class: 'mt-15',
		html: lang.date + ': <time datetime="' + txData.machineTime + '">' + txData.humanTime + '</time>'
	});

	var img = txData.direction === 'in' ?
		getLoadedIcon('wallet-to', 'tr-icon-in') :
		getLoadedIcon('wallet-from', 'tr-icon-out');

	return new Iridium.Builder({
		class: 'transaction',
		childs: [{ class: 'tr-img-container', childs: [img] }, dataStruct]
	}).build();
}

/**
 * Получает баланс кошелька с сервера и отображает его в панели навигации.
 */
function updateBalance()
{
	Iridium.Net.post(
		'?op=wallet.balance',
		null,
		function(result)
		{
			if(result.error)
			{
				console.error(result.error);
				return;
			}

			balance = result;
			document.getElementById('balance-place').innerHTML = getUniAmount(result.confirmed);
		}
	)
}

/**
 * Логирует и отображает ошибку в диалоговом окне.
 * @param {string} header Заголовок.
 * @param {string} content Содержимое ошибки.
 */
function displayError(header, content)
{
	console.error(header + '\n' + content);

	new Iridium.Popup({
		header: header,
		content: content,
		windowClass: 'window-error',
		closeButton: true,
		closeButtonContent: getLoadedIcon('cross')
	}).show();
}

/**
 * Подсвечивает ошибочное поле.
 * @param {HTMLElement} field Поле для ввода.
 */
function displayFieldError(field)
{
	Iridium.addClass(field, 'error');
	field.addEventListener('focus', function fieldFocus()
	{
		Iridium.removeClass(field, 'error');
		field.removeEventListener('focus', fieldFocus);
	});
}

function getFormData(form)
{
	var result   = {},
		tags     = ['input', 'textarea', 'select', 'combo-box', 'file-uploader'],
		query    = tags.join(','),
		elements = form.querySelectorAll(query);

	for(var i = 0; i < elements.length; i++)
	{
		var element = elements[i];

		if(element.type === 'checkbox' && !element.checked)
		{
			continue;
		}

		if(element.name && element.value)
		{
			result[element.name] = element.value;
		}
	}

	return result;
}

/**
 * Возвращает предварительно загруженную иокнку.
 * @param {string} iconName Название иконки.
 * @param {string} [iconClass] Класс иконки.
 * @returns {Node|null} Иконка или null.
 */
function getLoadedIcon(iconName, iconClass)
{
	var i = Iridium.SVG.getLoaded('/img/icons/' + iconName + '.svg');
	if(iconClass && i) { i.setAttribute('class', iconClass); }
	return i;
}

/**
 * Возвращает unix timestamp в секундах.
 * @returns {number}
 */
function getTimestamp()
{
	return Math.round(Date.now() / 1000);
}

function pad(n, width, z)
{
	z = z || '0';
	n = n + '';
	return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

function dateToHuman(isoStr)
{
	var date = new Date(isoStr);
	return [date.getDate(), date.getMonth() + 1, date.getFullYear()].join('.')
		+ ' '
		+ [date.getHours(), date.getMinutes(), date.getSeconds()].map(function(n) { return pad(n, 2); }).join(':');
}

/**
 * Возвращает количество в денежном формате.
 * @param amount
 * @returns {string}
 */
function getUniAmount(amount)
{
	return amount.toFixed(8) + ' UNI';
}

/**
 * Parses version in the Semantic Versioning notation.
 * TODO: move to the Iridium.Core.
 * @see https://semver.org/
 * @param {string} version Version in format <major>[.<minor>[.<patch>[-<prerelease>]]]
 * @returns {{major: number=, minor: number=, patch: number=, prerelease: string=}} Parsed version.
 */
function parseSemVer(version)
{
	// Ignore build metadata
	version = version.split('+')[0];

	var result     = {},
		preSplit   = version.split('-'),
		components = ['major', 'minor', 'patch'];

	if(preSplit.length === 2)
	{
		version           = preSplit[0];
		result.prerelease = preSplit[1];
	}

	var verSplit = version.split('.');

	for(var i = 0; i < components.length; i++)
	{
		if(verSplit[i])
		{
			result[components[i]] = parseInt(verSplit[i]);
		}
	}

	return result;
}

function compareSemVer(a, b)
{
	var fields = ['major', 'minor', 'patch'];

	function getPreNum(pre)
	{
		// If not defined, consider as release
		var prereleases = ['indev', 'alpha', 'beta', 'release'];
		return pre ? prereleases.indexOf(pre) : prereleases.length - 1;
	}

	var aPre = getPreNum(a),
		bPre = getPreNum(b);

	if(aPre > bPre)
	{
		return 1;
	}

	if(aPre < bPre)
	{
		return -1;
	}

	for(var i = 0; i < fields.length; i++)
	{
		var field = fields[i];

		if(!(a[field] || b[field]))
		{
			return 0;
		}

		if(!a[field] || a[field] < b[field])
		{
			return -1;
		}

		if(!b[field] || a[field] > b[field])
		{
			return 1;
		}
	}

	return 0;
}

if(!String.format)
{
	/**
	 * String formatting function.
	 * @param format
	 * @returns {string} Formatted output.
	 * @example
	 * String.format('{0} is dead, but {1} is alive! {0} {2}', 'ASP', 'ASP.NET');
	 * @see https://stackoverflow.com/questions/610406/javascript-equivalent-to-printf-string-format
	 */
	String.format = function(format)
	{
		var args = Array.prototype.slice.call(arguments, 1);
		return format.replace(/{(\d+)}/g, function(match, number)
		{
			return typeof args[number] != 'undefined' ? args[number] : match;
		});
	};
}