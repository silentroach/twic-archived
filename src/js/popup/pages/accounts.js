/**
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

/**
 * Accounts page implementation
 * todo annotations
 */
( function() {

	var
		/** @type {HTMLUListElement} */ list,
		/** @type {HTMLElement}      */ bottomStatus,
		/** @type {number}           */ removingAccountId,
		/** @type {HTMLElement}      */ firstAccountElement;

	var resetToolbar = function() {
		bottomStatus.innerHTML = chrome.i18n.getMessage('hint_select_or_remove');
		bottomStatus.classList.remove('alert');
	};

	var removeAccount = function() {
		twic.requests.send('accountRemove', {
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
				container = document.createElement('div'),
				bYes      = document.createElement('a'),
				bNo       = document.createElement('a');

			removingAccountId = link.id;

			bottomStatus.innerHTML = chrome.i18n.getMessage('alert_remove_account', link.title);
			container.className = 'container';

			bYes.innerHTML = chrome.i18n.getMessage('button_yes');
			bYes.className = 'button';
			bYes.href      = '#';

			bYes.onclick   = removeAccount;

			bNo.innerHTML  = chrome.i18n.getMessage('button_no');
			bNo.className  = 'button';
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
				firstAccountElement.innerText = chrome.i18n.getMessage('add_first_account');
				firstAccountElement.style.display = 'block';

				bottomStatus.style.display = 'none';
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
			var element = elements[i];

			var avatar = document.createElement('img');
			avatar.src = element['avatar'];
			avatar.className = 'avatar';

			var a = document.createElement('a');
			a.title = '@' + element['screen_name'];
			a.href = '#timeline#' + element['id'];
			// todo antilint (weird assignment) O.o think about it
			a.setAttribute('id', element['id']);

			a.appendChild(avatar);

			var utweets = element['unread_tweets'];
			if (utweets > 0) {
				var utspan = document.createElement('span');
				utspan.className = 'utweets';
				utspan.innerHTML = utweets;
				a.appendChild(utspan);
			}

			var li = document.createElement('li');

			li.appendChild(a);

			frag.appendChild(li);
		}

		list.appendChild(frag);
	};

	var refresh = function() {
		resetToolbar();

		clearList();
		twic.requests.send('accountList', {}, buildList);
	};

	var initPage = function() {
		var loading = false;

		list = document.querySelector('#accounts ul');
		bottomStatus = document.getElementById('accounts_status');

		list.oncontextmenu = accountContextClick;

		firstAccountElement = document.querySelector('#accounts p');

		document.getElementById('button_account_add').title = chrome.i18n.getMessage('hint_add_account');
		document.getElementById('button_about').title       = chrome.i18n.getMessage('hint_about');

		/**
		 * @this {HTMLElement}
		 */
		document.getElementById('button_account_add').onclick = function() {
			if (loading) {
				return false;
			}

			loading = true;

			this.querySelector('img').src = 'img/loader.gif';
			this.href = '#';

			// TODO handle errors
			twic.requests.send('accountAdd');
		};
	};

	twic.router.handle('accounts', function(data) {
		this.remember();

		this.initOnce(initPage);

		refresh();
	} );

}());
