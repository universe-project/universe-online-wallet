<div class="panel-center-container">
	<div class="panel login-panel">
		<div class="panel-header">{lang['auth.auth']}</div>
		<div class="panel-content">
			<form method="post" action="?op=user.login" id="login-form">
				<div class="input-group">
					<div class="input-field-icon-layout fill-width">
						<input type="email" name="email" id="email-field" class="input-field fill-width"
							   placeholder="{lang['auth.email_ph']}" autocomplete="email" required data-touchable>
						<div class="input-field-icon-cnt">
							<img class="input-field-icon" src="/img/icons/mail.svg" data-inline-svg>
						</div>
					</div>
				</div>
				<div class="input-group">
					<div class="input-field-icon-layout fill-width">
						<input type="password" name="password" id="password-field" class="input-field fill-width"
							   placeholder="{lang['auth.pass_ph']}" autocomplete="current-password" required data-touchable>
						<div class="input-field-icon-cnt">
							<img class="input-field-icon" src="/img/icons/lock.svg" data-inline-svg>
						</div>
					</div>
				</div>
				<div class="mt-15">
					<a data-part-link="resetPassRequest">{lang['lost_pwd.question']}</a>
				</div>
				<div id="error-message" class="mt-20 text-error"></div>
				<div class="mt-20 text-center">
					<button class="btn" type="submit">
						<span>{lang['auth.enter_btn']}</span>
						<div class="btn-icon-separator"></div>
						<img class="btn-icon" src="/img/icons/chevron-right.svg">
					</button>
				</div>
			</form>
		</div>
	</div>
</div>