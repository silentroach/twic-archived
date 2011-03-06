/**
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */
( function() {

	var
		/** @type {HTMLUListElement} */ list = document.querySelector('#accounts ul'),
		/** @type {HTMLElement}      */ firstAccountElement = document.querySelector('#accounts p');

	var clearList = function() {
		list.innerHTML = '';
	};

	var buildList = function(elements) {
		if (elements.length === 0) {
			if (firstAccountElement) {
				firstAccountElement.innerText = chrome.i18n.getMessage('add_first_account');
				firstAccountElement.style.display = 'block';
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

	document.getElementById('account_add').onclick = function() {
		this.innerHTML = chrome.i18n.getMessage('auth_confirm_wait');

		// TODO handle errors
		twic.requests.send('accountAdd');
	};

	document.querySelector('#account_add img').title = chrome.i18n.getMessage('hint_add_account');

	twic.router.handle('accounts', function(data) {
		clearList();
		twic.requests.send('accountList', {}, buildList);
	} );

}());
