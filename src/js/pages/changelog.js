/**
 * Страница списка изменений.
 */
pagesLoadData.changelog = {
	link: '?page=part.changelog',
	onLoad: function(data)
	{
		var container = document.getElementById('changelog-container');

		if(!data.changelog)
		{
			return;
		}

		data.changelog
			.sort(function(a, b) { return compareSemVer(parseSemVer(a.number), parseSemVer(b.number)); })
			.reverse()
			.forEach(function(version)
		{
			var semVer = parseSemVer(version.number),
				contentStruct = { class: 'panel-content', childs: [] };

			if(version.description)
			{
				contentStruct.childs.push({tag: 'p', html: version.description});
			}

			var changeTypes = {
				added: 'Добавлено',
				changed: 'Изменено',
				deprecated: 'Устарело',
				removed: 'Удалено',
				fixed: 'Исправлено',
				security: 'Безопасность'
			};

			for(var ct in changeTypes)
			{
				if(version[ct])
				{
					var ctItems = [];

					for(var i = 0; i < version[ct].length; i++)
					{
						ctItems.push({ tag: 'li', html: version[ct][i].description });
					}

					contentStruct.childs.push(new Iridium.Builder({
						class: 'changelog-section',
						childs: [
							{
								tag: 'h4',
								html: changeTypes[ct]
							},
							{
								tag: 'ul',
								childs: ctItems
							}
						]
					}).build());
				}
			}

			var panel = new Iridium.Builder({
				class: 'panel changelog-panel',
				childs: [
					{
						class: 'panel-header',
						html: '[' + version.number + '] &ndash; ' + version.date
					},
					contentStruct
				]
			}).build();

			var vcStr = '';

			if(semVer.major !== undefined)
			{
				vcStr += 'Major: ' + semVer.major;

				if(semVer.minor !== undefined)
				{
					vcStr += '<br>Minor: ' + semVer.minor;

					if(semVer.patch !== undefined)
					{
						vcStr += '<br>Patch: ' + semVer.patch;
					}
				}

				if(semVer.prerelease !== undefined)
				{
					vcStr += '<br>Stage: ' + semVer.prerelease;
				}
			}

			if(vcStr)
			{
				new Iridium.Tooltip({
					element: panel.getElementsByClassName('panel-header')[0],
					content: vcStr,
					margin: 15
				});
			}

			container.appendChild(panel);
		});
	}
};