<div class="section-row multicol main-section">
	<div class="panel">
		<div class="panel-header">{lang['total_balance']}</div>
		<div class="panel-content">
			<div class="stats-block stats-balance">
				<div class="stats-ico-wrap">
					<img class="stats-ico" src="/img/icons/arrow-up-down.svg" data-inline-svg>
				</div>
				<div class="stats-inf-wrap">
					<span class="stats-h">{lang['main.balance']}</span>
					<span class="stats-amount mt-5" id="balance-amt">0.00000000 UNI</span>
				</div>
			</div>

			<div class="stats-block stats-in">
				<div class="stats-ico-wrap">
					<img class="stats-ico" src="/img/icons/arrow-down.svg" data-inline-svg>
				</div>
				<div class="stats-inf-wrap">
					<span class="stats-h">{lang['main.in']}</span>
					<span class="stats-amount mt-5" id="in-amt">0.00000000 UNI</span>
				</div>
			</div>

			<div class="stats-block stats-out">
				<div class="stats-ico-wrap">
					<img class="stats-ico" src="/img/icons/arrow-up.svg" data-inline-svg>
				</div>
				<div class="stats-inf-wrap">
					<span class="stats-h">{lang['main.out']}</span>
					<span class="stats-amount mt-5" id="out-amt">0.00000000 UNI</span>
				</div>
			</div>

			<hr>

			<small>{lang['main.last_upd']}<br>{lang['main.freq_upd']}</small>
		</div>
	</div>

	<div class="panel">
		<div class="panel-header">
			{lang['addr.header']}
			<a class="action-btn" data-part-link="addresses" data-ir-tt="{lang['main.open_addr']}"
			   data-ir-tt-pos="bottom" data-ir-tt-mg="15">
				<div class="ico-wrap">
					<img src="/img/icons/list.svg" data-inline-svg>
				</div>
			</a>
		</div>
		<div class="panel-content" id="addresses-container"></div>
	</div>

	<div class="panel">
		<div class="panel-header">
			{lang['main.last_trans']}
			<a class="action-btn" data-part-link="transactions" data-ir-tt="{lang['main.open_trans']}"
			   data-ir-tt-pos="bottom"data-ir-tt-mg="15">
				<div class="ico-wrap">
					<img src="/img/icons/list.svg" data-inline-svg>
				</div>
			</a>
		</div>
		<div class="panel-content" id="transactions-container"></div>
	</div>

</div>