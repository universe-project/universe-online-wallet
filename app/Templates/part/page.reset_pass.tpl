<div class="panel-center-container">
	<div class="panel reset-pass-panel">
		<div class="panel-header">{lang['lost_pwd.change']}</div>
		<div class="panel-content">
			<form method="post" action="?op=user.resetPassword" id="reset-pass-form">
				<div class="input-group">
					<div class="input-field-icon-layout fill-width">
						<input type="password" name="password" id="password-field" class="input-field fill-width"
							   placeholder="{lang['lost_pwd.res.pass_pl']}" pattern="{password_regex}" data-touchable required
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
							   placeholder="{lang['lost_pwd.res.rep_pass_pl']}" pattern="{password_regex}" data-touchable required
							   autocomplete="new-password" data-ir-tt="{lang['user.rep_pass_tt']}"
							   data-ir-tt-event="focus" data-ir-tt-pos="top" data-ir-tt-lg-pos="right">
						<div class="input-field-icon-cnt">
							<img class="input-field-icon" src="/img/icons/lock.svg" data-inline-svg>
						</div>
					</div>
				</div>
				<div class="mt-20 text-right">
					<button class="btn" type="submit">
						<span>{lang['lost_pwd.res.btn']}</span>
						<div class="btn-icon-separator"></div>
						<img class="btn-icon" src="/img/icons/chevron-right.svg">
					</button>
				</div>
			</form>
		</div>
	</div>
</div>