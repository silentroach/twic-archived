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
		/** @type {number}  */ removingAccountId,
		/** @type {Element} */ firstAccountElement;

	var resetToolbar = function() {
		bottomStatus.innerHTML = twic.utils.lang.translate('title_select_or_remove');
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

			bottomStatus.innerHTML = twic.utils.lang.translate('alert_remove_account', link.title);
			container.className = 'container';

			bYes.innerHTML = twic.utils.lang.translate('button_yes');
			bYes.className = 'button';
			bYes.href      = '#';

			bYes.onclick   = removeAccount;

			bNo.innerHTML  = twic.utils.lang.translate('button_no');
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
				firstAccountElement.innerText = twic.utils.lang.translate('add_first_account');
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

		list = twic.dom.find('#accounts ul');
		bottomStatus = twic.dom.find('#accounts_status');

		list.oncontextmenu = accountContextClick;

		firstAccountElement = twic.dom.find('#accounts p');

		twic.dom.find('#button_account_add').title = twic.utils.lang.translate('title_add_account');
		twic.dom.find('#button_about').title       = twic.utils.lang.translate('title_about');

		/**
		 * @this {Element}
		 */
		twic.dom.find('#button_account_add').onclick = function() {
			if (loading) {
				return false;
			}

			loading = true;

			// @resource img/loader.gif
			twic.dom.find('img', this).src = 'img/loader.gif';
			this.href = '#';

			twic.requests.send('accountAdd');
		};
	};

	twic.router.handle('accounts', function(data) {
		this.remember();

		this.initOnce(initPage);

		refresh();
	} );

}());
