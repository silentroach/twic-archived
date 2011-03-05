/**
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

( function() {

	var
		/** @type {HTMLElement} */
		timeline = document.getElementById('timeline'),
		/** @type {HTMLUListElement} */
		list = document.querySelector('#timeline ul'),
		/** @type {RegExp} */
		urlPattern = /^https?:\/\/(www\.)?([^\/]+)?/i,
		/** @type {twic.vcl.tweetEditor} */
		tweetEditor = new twic.vcl.tweetEditor(timeline),
		/** @type {number} */
		userId;

	var parseTweetText = function(text) {
		// preparing urls
		var txt = text.replace(
			/[A-Za-z]+:\/\/[A-Za-z0-9-_]+\.[A-Za-z0-9-_:%&\?\/.=]+/g,
			function(url) {
				var
					stripped = url,
					parsed = urlPattern.exec(url);

				if (
					parsed
					&& parsed.length > 2
				) {
					stripped = parsed[2];
				} else
				if (stripped.length > 30) {
					stripped = stripped.substring(0, 30) + '&hellip;';
				}

				return '<a target="_blank" href="' + url + '" title="' + url + '">' + stripped + '</a>';
			}
		);

		// preparing nicks
		txt = txt.replace(
			/(^|\s)@(\w+)/g,
			'$1<a class="nick" target="_blank" href="http://twitter.com/#!/$2">@$2</a>'
		);

		// preparing hashtags
		txt = txt.replace(
			/(^|\s)#(\w+)/g,
			'$1<a class="hash" target="_blank" href="http://search.twitter.com/search?q=%23$2">#$2</a>'
		);

		return txt;
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

		for (id in data) {
			var
				item      = data[id],
				useOld    = prevUserId === item['user']['id'],
				li        = useOld && lastLi ? lastLi : document.createElement('li'),
				messageEl = document.createElement('p'),
				clearEl   = document.createElement('div'),
				msgText   = parseTweetText(item['msg']);

			if (!useOld) {
				var
					avatarEl  = document.createElement('img');

				avatarEl.src        = item['user']['avatar'];
				avatarEl.className  = 'avatar';
				avatarEl.title      = '@' + item['user']['name'];

				li.appendChild(avatarEl);

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
			// todo return to the accounts list screen
			return;
		}

		// make popup 60% of screen height
		//timeline.style.height = Math.round(screen.height / 100 * 60) + 'px';

		userId = parseInt(data[0], 10);

		twic.requests.send('getTimeline', {
			'id': userId
		}, function(list) {
			if (list) {
				buildList(list);
			}
		} );
	} );

	// ------------------------------------------------

	tweetEditor.setPlaceholder('placeholder_newtweet');

	tweetEditor.onTweetSend = function(tweetText) {
		twic.requests.send('sendTweet', {
			'id': userId,
			'tweet': tweetText
		}, function() {
			tweetEditor.clearText();
		} );
	};

}() );
