<header class="navbar">
	<button class="navbar-btn navbar-menu-btn" id="nav-btn">
		<img src="/img/icons/bars.svg">
	</button>

	<a class="navbar-logo" data-part-link="login" data-part-link-auth="main">
		<div class="logo-img-container">
			<img class="logo-img" src="/img/icons/uni.svg" alt="Universe Logo" data-inline-svg>
		</div>

		<span class="logo-text">
			Universe
			<small>online wallet</small>
		</span>
	</a>

	<nav class="navbar-nav mob-hidden" id="login-nav">
		<a href="{main_site_link}">{lang['navbar.currency']}</a>
		<a data-part-link="info" data-pl-tabs="info_tab" data-pl-tab-num="2">{lang['info.about']}</a>
		<a data-part-link="info" data-pl-tabs="info_tab" data-pl-tab-num="0">{lang['help']}</a>
		<a data-part-link="register">{lang['reg.reg']}</a>
	</nav>

	<div class="actions navbar-actions mob-hidden" id="nav-actions">
		<div class="action-group theme-act-group" style="display: none">

		</div>

		<div class="actions-group only-wallet balance-act-group">
			<span class="mob-hidden">{lang['total_balance']}: </span>
			<span class="text-mono ml-lg-10 childs-v-middle">
				<img class="desktop-hidden mr-5" src="/img/icons/arrow-up-down-m.svg" data-inline-svg>
				<span id="balance-place">0.00000001 UNI</span>
			</span>
		</div>
		<div class="action-group ml-lg-30 buttons-act-group">
			<button class="action-btn only-wallet" id="send-btn" data-ir-tt="{lang['navbar.send_money']}" data-ir-tt-pos="bottom"
					data-ir-tt-mg="20">
				<div class="ico-wrap">
					<img class="send-ico" src="/img/icons/wallet-from.svg" data-inline-svg>
				</div>
				<span class="action-name">{lang['navbar.send_money']}</span>
			</button>
			<button class="action-btn only-wallet" id="lock-btn" data-ir-tt="{lang['navbar.lock_wallet']}" data-ir-tt-pos="bottom"
					data-ir-tt-mg="20">
				<div class="ico-wrap">
					<img class="lock-ico" src="/img/icons/lock.svg" data-inline-svg>
				</div>
				<span class="action-name">{lang['navbar.lock_wallet']}</span>
			</button>
			<button class="action-btn only-wallet" id="exit-btn" data-ir-tt="{lang['navbar.exit']}" data-ir-tt-pos="bottom"
					data-ir-tt-mg="20">
				<div class="ico-wrap">
					<img class="exit-ico" src="/img/icons/exit.svg" data-inline-svg>
				</div>
				<span class="action-name">{lang['navbar.exit']}</span>
			</button>
			<button class="action-btn" id="lang-btn" data-ir-tt="{lang['navbar.change_lang']}" data-ir-tt-pos="bottom"
					data-ir-tt-mg="20">
				<div class="ico-wrap">
					<img class="lang-ico" src="/img/icons/globe.svg" data-inline-svg>
				</div>
				<span class="action-name">{lang['navbar.change_lang']}</span>
			</button>
		</div>
		<div class="action-group only-wallet ml-lg-30 user-act-group">
			<img class="user-ico" src="/img/icons/user.svg" data-inline-svg>
			<span id="email-place" class="ml-5">{email}</span>
		</div>
	</div>

	<button class="navbar-btn navbar-actions-btn" id="act-btn">
		<img src="/img/icons/actions.svg">
	</button>
</header>

<main class="layout">
	<menu id="wallet-nav-menu" class="menu mob-hidden">
		<nav>
			<a data-part-link="main">
				<img src="/img/icons/home.svg" data-inline-svg>
				<span>{lang['navbar.page.main']}</span>
			</a>
			<a data-part-link="addresses">
				<img src="/img/icons/address-book.svg" data-inline-svg>
				<span>{lang['navbar.page.addresses']}</span>
			</a>
			<a data-part-link="transactions">
				<img src="/img/icons/arrow-up-down.svg" data-inline-svg>
				<span>{lang['navbar.page.transactions']}</span>
			</a>
			<a data-part-link="options">
				<img src="/img/icons/gear.svg" data-inline-svg>
				<span>{lang['navbar.page.options']}</span>
			</a>
			<a data-part-link="info">
				<img src="/img/icons/help.svg" data-inline-svg>
				<span>{lang['help']}</span>
			</a>
		</nav>
	</menu>
	<div id="content" class="content"></div>
</main>

<footer class="copyright">
	Universe Project &copy; All Rights Reserved<br>
	<small class="very"><a data-part-link="changelog">v. {version}</a></small>
</footer>
<!-- Iridium Core Version: {iridium_version} -->