<div class="section-row">
	<div class="panel-h-center-container">
	<div class="panel options-panel">
		<div class="panel-header">{lang['options.title']}</div>
		<div class="panel-content">

			<h4>{lang['options.data']}</h4>

			<div class="input-group mt-20">
				<label for="email-field" class="input-label">{lang['options.email.lb']}:</label>
				<div class="input-group-horizontal">
					<div class="input-field-icon-layout fill-width">
						<input type="email" name="email" id="email-field" class="input-field fill-width"
							   placeholder="{lang['options.email.pl']}" pattern="{email_regex}" data-touchable
							   data-ir-tt="{if activation_enabled}{lang['options.email.tt_conf']}{else}{lang['options.email.tt']}{/if}"
							   data-ir-tt-event="focus" data-ir-tt-pos="top" data-ir-tt-xl-pos="left">
						<div class="input-field-icon-cnt">
							<img class="input-field-icon" src="/img/icons/mail.svg" data-inline-svg>
						</div>
					</div>
					<button id="change-email-btn" class="ml-15 btn only-icon"
							data-ir-tt="{lang['options.email.btn_tt']}" data-ir-tt-pos="bottom" data-ir-tt-mg="15">
						<img class="btn-icon" src="/img/icons/chevron-right.svg">
					</button>
				</div>

				<div class="mt-10">
					<small>{lang['options.email.curr']}: <span id="current-email">{email}</span></small>
				</div>
			</div>

			<div class="input-group">
				<label for="password-field" class="input-label">{lang['options.pass.lb']}:</label>
				<div class="input-field-icon-layout fill-width">
					<input type="password" name="password" id="password-field" class="input-field fill-width"
						   placeholder="{lang['options.pass.pl']}" pattern="{password_regex}" data-touchable
						   data-ir-tt="{lang['user.pass_tt']}"
						   data-ir-tt-event="focus" data-ir-tt-pos="top" data-ir-tt-xl-pos="left">
					<div class="input-field-icon-cnt">
						<img class="input-field-icon" src="/img/icons/lock.svg" data-inline-svg>
					</div>
				</div>
			</div>
			<div class="input-group">
				<div class="input-group-horizontal">
					<div class="input-field-icon-layout fill-width">
						<input type="password" name="repeat_password" id="password-repeat-field" class="input-field fill-width"
							   placeholder="{lang['options.pass.rep_pl']}" pattern="{password_regex}" data-touchable
							   data-ir-tt="{lang['user.rep_pass_tt']}"
							   data-ir-tt-event="focus" data-ir-tt-pos="top" data-ir-tt-xl-pos="left">
						<div class="input-field-icon-cnt">
							<img class="input-field-icon" src="/img/icons/lock.svg" data-inline-svg>
						</div>
					</div>
					<button id="change-pass-btn" class="ml-15 btn only-icon"
							data-ir-tt="{lang['options.pass.btn_tt']}" data-ir-tt-pos="bottom" data-ir-tt-mg="15">
						<img class="btn-icon" src="/img/icons/chevron-right.svg">
					</button>
				</div>
			</div>

			<hr>

			<h4>{lang['options.wallet']}</h4>

			<form id="options-form" method="post" action="index.php?op=user.options.change">
				<div class="input-group mt-20">
					<label for="change-address-field" class="input-label">{lang['options.change.lb']}:</label>
					<div class="input-group-horizontal">
						<div class="input-field-icon-layout fill-width">
							<div id="change-cb-place"></div>
							<div class="input-field-icon-cnt">
								<img class="input-field-icon" src="/img/icons/user.svg" data-inline-svg>
							</div>
						</div>
						<button id="addr-list-btn" class="ml-15 btn only-icon">
							<img class="btn-icon" src="/img/icons/address-book.svg">
						</button>
						<button id="reset-change-addr-btn" class="ml-10 btn only-icon">
							<img class="btn-icon" src="/img/icons/cross.svg">
						</button>
					</div>
					<div class="mt-10">
						<small>{lang['options.change.desc']}</small>
					</div>
				</div>

				<div class="input-group">
					<label class="input-label">{lang['options.lock.lb']}:</label>
					<div id="wallet-lock-cb-place"></div>
				</div>

				<div class="input-group">
					<div class="input-group-horizontal">
						<label class="input-label" for="pin-field">{lang['pin.pin']}: </label>
						<input type="password" value="{pin}" name="pin" id="pin-field" pattern="{html}[0-9]{4}{/html}" maxlength="4" size="4"
							   class="input-field ml-20" placeholder="_  _  _  _" data-touchable>
						<button id="reset-pin" class="ml-15 btn only-icon">
							<img class="btn-icon" src="/img/icons/cross.svg">
						</button>
					</div>
					<div class="mt-10">
						<small>{lang['options.pin_desc']}</small>
					</div>
				</div>

				<div class="mt-20 text-right"><button class="btn">{lang['save']}</button></div>
			</form>
		</div>
	</div>
</div>
</div>