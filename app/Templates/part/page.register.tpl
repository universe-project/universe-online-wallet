<div class="panel-center-container">
	<div class="panel register-panel">
		<div class="panel-header">{lang['reg.reg']}</div>
		<div class="panel-content">
			<form id="register-form" method="post" action="index.php?op=user.register">
				<div class="input-group">
					<label for="email-field" class="input-label">{lang['user.email']}:</label>
					<div class="input-field-icon-layout fill-width">
						<input type="email" name="email" id="email-field" class="input-field fill-width"
							   placeholder="{lang['reg.email.pl']}" pattern="{email_regex}" data-touchable required
							   autocomplete="email"
							   data-ir-tt="{if activation_enabled}{lang['reg.email.tt_a']}{else}{lang['reg.email.tt_na']}{/if}"
							   data-ir-tt-event="focus" data-ir-tt-pos="top" data-ir-tt-lg-pos="right">
						<div class="input-field-icon-cnt">
							<img class="input-field-icon" src="/img/icons/mail.svg" data-inline-svg>
						</div>
					</div>
				</div>
				<div class="input-group">
					<label for="password-field" class="input-label">{lang['user.pass']}:</label>
					<div class="input-field-icon-layout fill-width">
						<input type="password" name="password" id="password-field" class="input-field fill-width"
							   placeholder="{lang['reg.pass.pl']}" pattern="{password_regex}" data-touchable required
							   autocomplete="new-password" data-ir-tt="{lang['user.pass_tt']}"
							   data-ir-tt-event="focus" data-ir-tt-pos="top" data-ir-tt-lg-pos="right">
						<div class="input-field-icon-cnt">
							<img class="input-field-icon" src="/img/icons/lock.svg" data-inline-svg>
						</div>
					</div>
				</div>
				<div class="input-group">
					<div class="input-field-icon-layout fill-width">
						<input type="password" name="repeat_password" id="repeat-password-field" class="input-field fill-width"
							   placeholder="{lang['reg.pass.rep_pl']}" pattern="{password_regex}" data-touchable required
							   autocomplete="new-password"
							   data-ir-tt="{lang['user.rep_pass_tt']}"
							   data-ir-tt-event="focus" data-ir-tt-pos="top" data-ir-tt-lg-pos="right">
						<div class="input-field-icon-cnt">
							<img class="input-field-icon" src="/img/icons/lock.svg" data-inline-svg>
						</div>
					</div>
				</div>
				<div class="input-group">
					<label class="input-label" for="captcha">{lang['reg.captcha.lb']}:</label>
					<div class="input-group-horizontal">
						<input type="text" name="captcha" id="captcha" class="input-field fill-width"
							   placeholder="{lang['reg.captcha.pl']}" autocomplete="off">
						<img src="/img/icons/arrow-left.svg" class="captcha-left-icon" data-inline-svg>
						<div class="captcha-img-container">
							<img id="captcha-img" class="captcha-img">
							<div id="captcha-bar" class="captcha-upd-bar"></div>
						</div>
					</div>
				</div>
				{if invites}
				<div class="warning-block mt-20"><small class="text-warning">{lang['reg.invites_warn']}</small></div>
				{/if}
				<div class="mt-20 text-center">
					<button class="btn" type="submit">
						<span>{lang['reg.btn']}</span>
						<div class="btn-icon-separator"></div>
						<img class="btn-icon" src="/img/icons/chevron-right.svg">
					</button>
				</div>
				<div id="error-message" class="mt-20 text-error"></div>
				<div class="mt-20 text-center"><small>{lang['reg.agreement']}</small></div>
			</form>
		</div>
	</div>
</div>