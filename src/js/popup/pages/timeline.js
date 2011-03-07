/**
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

( function() {

	var
		/** @type {HTMLElement}          */ timeline,
		/** @type {HTMLUListElement}     */ list,
		/** @type {HTMLElement}          */ newTweet,
		/** @type {twic.vcl.tweetEditor} */	tweetEditor,
		/** @type {number}               */ userId;

	var initPage = function() {
		timeline = document.getElementById('timeline');
		list = timeline.querySelector('ul');
		newTweet = timeline.querySelector('.newtweet');

		timeline.querySelector('.toolbar a').innerHTML = chrome.i18n.getMessage('toolbar_accounts');

		tweetEditor = new twic.vcl.tweetEditor(newTweet);
		tweetEditor.setPlaceholder('placeholder_newtweet');

		tweetEditor.onTweetSend = function(tweetText) {
			twic.requests.send('sendTweet', {
				'id': userId,
				'tweet': tweetText
			}, function() {
				tweetEditor.clearText();
			} );
		};
	};

	var buildList = function(info) {
		var
			frag = document.createDocumentFragment(),
			prevUserId = -1,
			lastLi,
			lastCl,
			id,
			userName = info['account']['name'],
			data = info['data'];

		var accountNameElement = timeline.querySelector('.toolbar p');
		accountNameElement.innerHTML = '@' + userName;

		for (id in data) {
			var
				item        = data[id],
				useOld      = prevUserId === item['user']['id'],
				li          = useOld && lastLi ? lastLi : document.createElement('li'),
				messageEl   = document.createElement('p'),
				clearEl     = document.createElement('div'),
				profileLink = document.createElement('a'),
				msgText     = twic.twitter.parseTweet(item['msg']);

			if (!useOld) {
				var
					avatarEl  = document.createElement('img');

				profileLink.title = '@' + item['user']['name'];
				profileLink.className = 'avatar';
				profileLink.href = '#profile#' + item['user']['name'];

				avatarEl.src       = item['user']['avatar'];
				avatarEl.className = 'avatar';

				profileLink.appendChild(avatarEl);
				li.appendChild(profileLink);

				prevUserId = item['user']['id'];

				if (prevUserId === userId) {
					li.className = 'me';
				}

				lastLi = li;
			}

			messageEl.innerHTML = msgText;
			messageEl.className = 'msg';
			messageEl.id = id;

			// highlight the message with mention
			if (msgText.indexOf('>@' + userName + '<') >= 0) {
				messageEl.className += ' mention';
			}

			li.appendChild(messageEl);

			if (useOld) {
				lastCl.parentNode.removeChild(lastCl);
			}

			clearEl.className = 'clearer';
			lastCl = clearEl;

			li.appendChild(clearEl);

			frag.appendChild(li);
		}

		list.appendChild(frag);
	};

	twic.router.handle('timeline', function(data) {
		if (
			!data.length
			|| 1 !== data.length
		) {
			location.hash = '#accounts';
			return;
		}

		this.remember();
		this.init(initPage);

		// fixme check if popup is out of screen
		//if (window.screenY + window.outerHeight > screen.height) {
		//	twic.dom(timeline).css('height', screen.height - window.screenY);
		//}

		list.innerHTML = '';

		userId = parseInt(data[0], 10);

		twic.requests.send('getTimeline', {
			'id': userId
		}, buildList);
	} );

}() );
