/**
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

/**
 * Home timeline implementation
 * todo annotations missed
 */
( function() {

	var
		/** @type {twic.vcl.Timeline}    */ timeline,
		/** @type {HTMLElement}          */ page,
		/** @type {HTMLUListElement}     */ list,
		/** @type {HTMLElement}          */ accountNameElement,
		/** @type {HTMLElement}          */ newTweet,
		/** @type {twic.vcl.TweetEditor} */	tweetEditor,
		/** @type {number}               */ userId,
		/** @type {Object}               */ mPos = {x: 0, y: 0};

	// todo maybe it is not a great implementation of handling only a click (not a selection)?

	var checkIsTweetClicked = function(e) {
		if (
			!e.srcElement
			|| !e.srcElement.classList.contains('msg')
		) {
			mPos.x = 0;
			mPos.y = 0;

			return false;
		}

		return true;
	};

	var onTimeLineMouseDown = function(e) {
		e.stopPropagation();

		if (checkIsTweetClicked(e)) {
			mPos.x = e.x;
			mPos.y = e.y;
		}

		return true;
	};

	var onTimeLineMouseUp = function(e) {
		e.stopPropagation();

		if (
			checkIsTweetClicked(e)
			&& mPos.x === e.x
			&& mPos.y === e.y
		) {
			console.dir(e);
		}

		return true;
	};

	var buildList = function(info) {
		var
			id,
			userName = info['account']['name'],
			data     = info['data'];

		accountNameElement.innerHTML = '@' + userName;

		timeline.setUserId(info['account']['id']);
		timeline.setUserNick(userName);

		for (id in data) {
			var
				item  = data[id],
				tweet = new twic.vcl.Tweet(timeline);

			tweet.setId(id);
			tweet.setAuthorId(item['user']['id']);
			tweet.setAuthorNick(item['user']['name']);
			tweet.setAuthorAvatar(item['user']['avatar']);
			// after all to check for mention
			tweet.setText(item['msg']);
			timeline.addTweet(tweet);
		}
	};

	var update = function() {
		list.innerHTML = '';

		// todo thank about smarter way to refresh the timeline
		twic.requests.send('getTimeline', {
			'id': userId
		}, buildList);
	};

	var initPage = function() {
		page = document.getElementById('timeline');
		accountNameElement = page.querySelector('.toolbar p');

		timeline = new twic.vcl.Timeline(page);

		list = page.querySelector('ul');
		newTweet = page.querySelector('.newtweet');

		page.addEventListener('mouseup', onTimeLineMouseUp);
		page.addEventListener('mousedown', onTimeLineMouseDown);

		page.querySelector('.toolbar a').innerHTML = chrome.i18n.getMessage('toolbar_accounts');

		tweetEditor = new twic.vcl.TweetEditor(userId, newTweet);
		tweetEditor.setPlaceholder('placeholder_newtweet');

		tweetEditor.onTweetSend = function(tweetText) {
			twic.requests.send('sendTweet', {
				'id': userId,
				'tweet': tweetText
			}, function() {
				tweetEditor.reset();
				update();
			} );
		};
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
		this.initOnce(initPage);

		// todo check if popup is out of screen
		//if (window.screenY + window.outerHeight > screen.height) {
		//	twic.dom(timeline).css('height', screen.height - window.screenY);
		//}

		accountNameElement.innerHTML = '';

		userId = parseInt(data[0], 10);

		update();
	} );

}() );
