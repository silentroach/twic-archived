/**
 * Accounts page implementation
 *
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

// todo annotations
( function() {

	var
		/** @type {Element} */ list,
		/** @type {Element} */ bottomStatus,
		/** @type {Element} */ elementAccountAdd,
		/** @type {number}  */ removingAccountId,
		/** @type {Element} */ firstAccountElement;

	var resetToolbar = function() {
		bottomStatus.innerHTML = twic.utils.lang.translate('title_select_or_remove');
		bottomStatus.classList.remove('alert');
	};

	var removeAccount = function() {
		twic.requests.makeRequest('accountRemove', {
			'id': removingAccountId
		}, function() {
			refresh();
		} );
	};

	var accountContextClick = function(e) {
		if (
			e.srcElement
			&& e.srcElement.tagName === 'IMG'
			&& e.srcElement.className === 'avatar'
		) {
			var
				link      = e.srcElement.parentNode,
				container = twic.dom.expandElement('div.container'),
				bYes      = twic.dom.expandElement('a.button'),
				bNo       = twic.dom.expandElement('a.button');

			elementAccountAdd.classList.remove('pulsate');
			removingAccountId = link.id;

			bottomStatus.innerHTML = twic.utils.lang.translate('alert_remove_account', link.title);

			bYes.innerHTML = twic.utils.lang.translate('button_yes');
			bYes.href      = '#';

			bYes.onclick   = removeAccount;

			bNo.innerHTML  = twic.utils.lang.translate('button_no');
			bNo.href       = '#';

			bNo.onclick    = resetToolbar;

			container.appendChild(bYes);
			container.appendChild(bNo);

			bottomStatus.appendChild(container);

			bottomStatus.classList.add('alert');
		}
	};

	var clearList = function() {
		list.innerHTML = '';
	};

	var buildList = function(elements) {
		if (elements.length === 0) {
			if (firstAccountElement) {
				firstAccountElement.innerText = twic.utils.lang.translate('add_first_account');
				firstAccountElement.style.display = 'block';

				elementAccountAdd.classList.add('pulsate');

				twic.dom.setVisibility(bottomStatus, false);
			}

			return;
		} else {
			if (firstAccountElement) {
				firstAccountElement.style.display = '';
			}
		}

		var
			frag = document.createDocumentFragment(),
			i;

		for (i = 0; i < elements.length; ++i) {
			var
				element = elements[i],
				avatar = twic.dom.expandElement('img.avatar'),
				a = twic.dom.expandElement('a#' + element['id']),
				utweets = element['unread_tweets'],
				li = twic.dom.expandElement('li');

			avatar.src = element['avatar'];

			a.title = '@' + element['screen_name'];
			a.href = '#timeline#' + element['id'];

			a.appendChild(avatar);

			if (utweets > 0) {
				var
					utspan = twic.dom.expandElement('span.utweets');

				utspan.innerHTML = utweets;

				a.appendChild(utspan);
			}

			li.appendChild(a);

			frag.appendChild(li);
		}

		list.appendChild(frag);
	};

	var refresh = function() {
		resetToolbar();

		clearList();
		twic.requests.makeRequest('accountList', {}, buildList);
	};

	var initPage = function() {
		var loading = false;

		list = twic.dom.findElement('#accounts ul');
		bottomStatus = twic.dom.findElement('#accounts_status');
		elementAccountAdd = twic.dom.findElement('#button_account_add');

		list.oncontextmenu = accountContextClick;

		firstAccountElement = twic.dom.findElement('#accounts p');

		elementAccountAdd.title                           = twic.utils.lang.translate('title_add_account');
		twic.dom.findElement('#button_settings').title    = twic.utils.lang.translate('title_settings');
		twic.dom.findElement('#button_about').title       = twic.utils.lang.translate('title_about');

		/**
		 * @this {Element}
		 */
		twic.dom.findElement('#button_account_add').onclick = function() {
			var
				buttonElement = twic.dom.findElement('img', this),
				oldSource = buttonElement.src;

			if (loading) {
				return false;
			}

			loading = true;

			// @resource img/loader.gif
			buttonElement.src = 'img/loader.gif';
			this.href = '#';

			twic.requests.makeRequest('accountAdd', { }, function(reply) {
				if (twic.global.SUCCESS === reply['result']) {
					window.close();
				} else {
					buttonElement.src = oldSource;

					bottomStatus.innerHTML = twic.utils.lang.translate('alert_account_add_failed');
					bottomStatus.classList.add('alert');
					bottomStatus.style.display = 'block';
				}
			} );
		};
	};

	// --------------------------------------------------------------------------------------------------

	twic.router.handle('accounts', function(data) {
		this.remember();

		this.initOnce(initPage);

		refresh();
	} );

}());
