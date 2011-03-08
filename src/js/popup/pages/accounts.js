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

	var initPage = function() {
		var loading = false;

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

		document.getElementById('button_account_add').title = chrome.i18n.getMessage('hint_add_account');
		document.getElementById('button_about').title = chrome.i18n.getMessage('hint_about');
	};

	twic.router.handle('accounts', function(data) {
		this.remember();

		this.initOnce(initPage);

		clearList();
		twic.requests.send('accountList', {}, buildList);
	} );

}());
