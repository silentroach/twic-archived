/**
 * Home timeline implementation
 *
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

( function() {

	var
		/** @type {twic.vcl.Timeline}    */ timeline,
		/** @type {Element}              */ page,
		/** @type {Element}              */ accountNameElement,
		/** @type {Element}              */ newTweet,
		/** @type {twic.vcl.TweetEditor} */ tweetEditor,
		/** @type {number}               */ userId;

	var doRetweet = function(userId, tweetId, callback) {
		twic.requests.send('retweet', {
			'userId': userId,
			'tweetId': tweetId
		}, function() {
			callback();

			tweetEditor.reset();
			update();
		} );
	};

	var doDelete = function(userId, tweetId, callback) {
		twic.requests.send('delete', {
			'userId': userId,
			'tweetId': tweetId
		}, function() {
			callback();

			tweetEditor.reset();
			update();
		} );
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
				item      = data[id],
				user      = item['user'],
				retweeted = item['retweeted'],
				tweet     = timeline.addTweet(id);

			if (retweeted) {
				tweet.setAuthor(retweeted['id'], retweeted['screen_name'], retweeted['avatar']);
				tweet.setRetweeter(user['id'], user['screen_name'], user['avatar']);
			} else {
				tweet.setAuthor(user['id'], user['screen_name'], user['avatar']);
			}

			tweet.setText(item['msg']);
		}

		timeline.endUpdate();
	};

	var update = function() {
		// fixme clear the timeline
		timeline.clear();

		timeline.beginUpdate();

		// todo thank about smarter way to refresh the timeline
		twic.requests.send('getTimeline', {
			'id': userId
		}, buildList);
	};

	var initPage = function() {
		page = twic.dom.findElement('#timeline');
		accountNameElement = twic.dom.findElement('.toolbar p', page);

		timeline = new twic.vcl.Timeline(page);
		timeline.onRetweet = doRetweet;
		timeline.onDelete  = doDelete;

		newTweet = twic.dom.findElement('.newtweet', page);

		twic.dom.findElement('.toolbar a', page).innerHTML = twic.utils.lang.translate('toolbar_accounts');
	};

	twic.router.handle('timeline', function(data) {
		if (
			!data.length
			|| 1 !== data.length
		) {
			window.location.hash = '#accounts';
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

		newTweet.innerHTML = '';

		tweetEditor = new twic.vcl.TweetEditor(userId, newTweet);

		tweetEditor.onTweetSend = function(tweetText) {
			twic.requests.send('sendTweet', {
				'id': userId,
				'tweet': tweetText
			}, function() {
				tweetEditor.reset();
				update();
			} );
		};

		update();
	} );

}() );
