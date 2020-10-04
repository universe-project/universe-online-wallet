<div class="section section-row transactions-section">
	<div class="panel no-shrink">
		<div class="panel-header">{lang['trans.panel_ctrl']}</div>
		<div class="panel-content">
			<div class="input-group">
				<div class="input-group-horizontal">
					<div class="input-field-icon-layout fill-width">
						<div id="address-cb-place"></div>
						<div class="input-field-icon-cnt">
							<img class="input-field-icon" src="/img/icons/user.svg" data-inline-svg>
						</div>
					</div>
					<button id="addr-list-btn" class="ml-15 btn only-icon">
						<img class="btn-icon" src="/img/icons/address-book.svg">
					</button>
					<button id="reset-addr-btn" class="ml-10 btn only-icon">
						<img class="btn-icon" src="/img/icons/cross.svg">
					</button>
				</div>
			</div>
			<hr>
			<label class="input-label">{lang['trans.ctrl.type']}:</label>
			<div class="input-group mt-10">
				<input type="checkbox" class="input-checkbox" id="in-chkbx">
				<label class="input-label" for="in-chkbx"><span>{lang['trans.in']}</span></label>
			</div>
			<div class="input-group">
				<input type="checkbox" class="input-checkbox" id="out-chkbx">
				<label class="input-label" for="out-chkbx"><span>{lang['trans.out']}</span></label>
			</div>
			<hr>
			<div class="text-center">
				<button id="prev-page-btn" class="btn only-icon">
					<img class="btn-icon" src="/img/icons/chevron-left.svg">
				</button>
				<span class="pagination-text" id="pages-txt">0/0</span>
				<button id="next-page-btn" class="btn only-icon">
					<img class="btn-icon" src="/img/icons/chevron-right.svg">
				</button>
			</div>
		</div>
	</div>

	<div class="panel mt-20 mt-lg-0 ml-lg-20 flex-fill">
		<div class="panel-header">{lang['trans.panel_list']}</div>
		<div class="panel-content" id="transactions-container"></div>
	</div>
</div>