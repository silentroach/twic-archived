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

	var updateTop = function() {
		timeline.beginUpdate(false, true);

		twic.requests.makeRequest('getTimeline', {
			'id': userId,
			'after': timeline.getLastId()
		}, buildList);
	};

	var doOldRetweet = function(text) {
		tweetEditor.setText(text);
		tweetEditor.setFocus(true);
	};

	var doRetweet = function(userId, tweetId, callback) {
		twic.requests.makeRequest('retweet', {
			'userId': userId,
			'tweetId': tweetId
		}, function() {
			callback();

			tweetEditor.reset();
			updateTop();
		} );
	};

	var doDelete = function(userId, tweetId, callback) {
		twic.requests.makeRequest('delete', {
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

				// todo refactor with bottom
				if (retweeted['is_protected']) {
					tweet.setProtected();
				}
			} else {
				tweet.setAuthor(user['id'], user['screen_name'], user['avatar']);

				if (user['is_protected']) {
					tweet.setProtected();
				}
			}

			if (item['separator']) {
				tweet.setSeparator();
			}

			if ('dt' in item) {
				tweet.setUnixTime(item['dt']);
			}

			if ('source' in item) {
				tweet.setSource(item['source']);
			}

			tweet.setText(item['msg']);
		}

		timeline.endUpdate();
	};

	var update = function() {
		timeline.clear();

		timeline.beginUpdate();

		// todo thank about smarter way to refresh the timeline
		twic.requests.makeRequest('getTimeline', {
			'id': userId
		}, buildList);
	};

	var tweetHandler = function(editor, tweetText, replyId, callback) {
		var finish = function() {
			callback();
			updateTop();
		};

		if (replyId) {
			twic.requests.makeRequest('replyTweet', {
				'id': userId,
				'tweet': tweetText,
				'replyTo': replyId
			}, finish);
		} else {
			twic.requests.makeRequest('sendTweet', {
				'id': userId,
				'tweet': tweetText
			}, finish);
		}
	};

	var timelineResetEditor = function() {
		timeline.resetEditor();
	};

	var getSuggestList = function(startPart) {

	};

	var initPage = function() {
		page = twic.dom.findElement('#timeline');
		accountNameElement = twic.dom.findElement('.toolbar p', page);

		timeline = new twic.vcl.Timeline(page);
		timeline.onReplySend = tweetHandler;
		timeline.onRetweet = doRetweet;
		timeline.onOldRetweet = doOldRetweet;
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

		accountNameElement.innerHTML = '';

		userId = parseInt(data[0], 10);

		newTweet.innerHTML = '';

		tweetEditor = new twic.vcl.TweetEditor(userId, newTweet);
		tweetEditor.onFocus     = timelineResetEditor;
		tweetEditor.onTweetSend = tweetHandler;
		tweetEditor.onGetSuggestList = getSuggestList;

		update();
	} );

}() );
