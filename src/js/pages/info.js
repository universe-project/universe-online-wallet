/**
 * Страница информации.
 */
pagesLoadData.info = {
	link: '?page=part.info',
	onLoad: function()
	{
		Iridium.Init.launch(content);

		// Инициализация разметки документов
		var layoutElements = document.getElementsByClassName('document-layout');
		for(var i = 0; i < layoutElements.length; i++)
		{
			initDocumentLayout(layoutElements[i]);
		}
	},
	onClose: function()
	{
		Iridium.UrlData.removeAll();
	}
};

/**
 * Выполняет инициализацию разметки документа:
 * - Автогенерация оглавления.
 * - Якорная навигация.
 * @param {Element} layoutElement Элемент документа.
 */
function initDocumentLayout(layoutElement)
{
	var contEls   = layoutElement.getElementsByClassName('document-content'),
		structEls = layoutElement.getElementsByClassName('document-structure');

	if(!(contEls.length && structEls.length))
	{
		return;
	}

	var docContent = contEls[0],
		docStruct = structEls[0],
		headersSelector = Iridium.range(1, 6).map(function(n) { return 'h' + n; }).join(','),
		headers = docContent.querySelectorAll(headersSelector),
		structures = [],
		stack = [];

	if(!headers.length)
	{
		return;
	}

	function stackLast()
	{
		return stack[stack.length - 1];
	}

	for(var i = 0; i < headers.length; i++)
	{
		var header = headers[i],
			structure = {
				element: header,
				content: header.innerHTML,
				number: parseInt(header.tagName.charAt(1)),
				childs: []
			};

		// Есть родитель
		if(stack.length)
		{
			var parent = stackLast(),
				parentNum = parent.number;

			if(structure.number > parentNum)
			{
				// На уровень ниже (подзаголовок)
				parent.childs.push(structure);
				stack.push(structure);
			}
			else if(structure.number < parentNum)
			{
				// Возвращаемся наверх

				do
				{
					var pe = stack.pop();
				}
				while(pe && pe.number > structure.number);

				if(stack.length)
				{
					// Есть родитель
					stackLast().childs.push(structure);
				}
				else
				{
					// Нет родителя
					structures.push(structure);
				}

				stack.push(structure);
			}
			else
			{
				// Тот же уровень

				stack.pop();

				if(stack.length)
				{
					stackLast().childs.push(structure);
				}
				else
				{
					structures.push(structure);
				}

				stack.push(structure);
			}

			continue;
		}

		stack.push(structure);
		structures.push(structure);
	}

	function generateBuilderStruct(structures, parentNum)
	{
		var listStruct = {
			tag: 'ol',
			childs: []
		};

		structures.forEach(function(str, i)
		{
			var num = (parentNum ? parentNum : '') + (i + 1) + '.';
			str.element.innerHTML = num + ' ' + str.element.innerHTML;

			var itemStruct = {
				tag: 'li',
				childs: [
					{
						tag: 'a',
						html: num + ' ' + str.content,
						on: {
							click: function(e)
							{
								e.preventDefault();
								str.element.scrollIntoView({block: 'start', behavior: 'smooth'})
							}
						}
					}
				]
			};

			if(str.childs.length)
			{
				itemStruct.childs.push(generateBuilderStruct(str.childs, num));
			}

			listStruct.childs.push(itemStruct);
		});

		return listStruct;
	}

	docStruct.appendChild(new Iridium.Builder(generateBuilderStruct(structures)).build());
}