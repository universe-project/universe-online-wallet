<div class="panel-center-container">
	<div class="panel reset-pass-request-panel">
		<div class="panel-header">{lang['lost_pwd.req.header']}</div>
		<div class="panel-content">
			{if enabled}
			<form method="post" action="?op=user.resetPasswordRequest" id="reset-pass-request-form">
				<p>{lang['lost_pwd.req.desc']}</p>
				<div class="input-group mt-20">
					<div class="input-field-icon-layout fill-width">
						<input type="email" name="email" autocomplete="email" id="email-field" class="input-field fill-width"
							   placeholder="{lang['lost_pwd.req.email_pl']}" pattern="{email_regex}" required data-touchable>
						<div class="input-field-icon-cnt">
							<img class="input-field-icon" src="/img/icons/mail.svg" data-inline-svg>
						</div>
					</div>
				</div>
				<div class="input-group">
					<label class="input-label" for="captcha">{lang['lost_pwd.req.captcha_label']}:</label>
					<div class="input-group-horizontal">
						<input type="text" name="captcha" id="captcha" class="input-field fill-width"
							   placeholder="{lang['lost_pwd.req.captcha_pl']}" required autocomplete="off">
						<img src="/img/icons/arrow-left.svg" class="captcha-left-icon" data-inline-svg>
						<div class="captcha-img-container">
							<img id="captcha-img" class="captcha-img">
							<div id="captcha-bar" class="captcha-upd-bar"></div>
						</div>
					</div>
				</div>
				<div class="mt-20 text-right">
					<button class="btn" type="submit">
						<span>{lang['lost_pwd.req.send']}</span>
						<div class="btn-icon-separator"></div>
						<img class="btn-icon" src="/img/icons/chevron-right.svg">
					</button>
				</div>
			</form>
			{else}
			<p>{lang['lost_pwd.disabled']}</p>
			{/if}
		</div>
	</div>
</div>