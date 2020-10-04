<!DOCTYPE html>
<html lang="{lang}">
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1">

		<link href="https://fonts.googleapis.com/css?family=Open+Sans:300,400,600&amp;subset=cyrillic" rel="stylesheet">
		<link href="https://fonts.googleapis.com/css?family=Fira+Mono:400,500&amp;subset=cyrillic" rel="stylesheet">

		<link rel="icon" sizes="48x48" href="/img/icon_48.png">
		<link rel="icon" sizes="96x96" href="/img/icon_96.png">
		<link rel="icon" sizes="144x144" href="/img/icon_144.png">
		<link rel="icon" sizes="192x192" href="/img/icon_192.png">

		<!-- Chrome, Firefox OS and Opera -->
		<meta name="theme-color" content="#157bbf">
		<!-- Windows Phone -->
		<meta name="msapplication-navbutton-color" content="#157bbf">
		<!-- iOS Safari -->
		<meta name="apple-mobile-web-app-status-bar-style" content="#157bbf">

		<link rel="manifest" href="/manifest.json">

		<title>{title}</title>
		{foreach css_file in css}
			<link rel="stylesheet" href="{css_file}">
		{/foreach}
	</head>
	<body>
		{page}
		{js_page_data}
		{foreach js_file in js}
			<script src="{js_file}"></script>
		{/foreach}
	</body>
</html>