/**
 * Timeline page support
 *
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

// listen for the "getTimeline" request
twic.requests.subscribe('getTimeline', function(data, sendResponse) {
	// check for id in request data
	if (!data['id']) {
		sendResponse({ });
		return;
	}

	var
		id = data['id'],
		afterId = data['after'],
		account = twic.accounts.getInfo(id);

	// prepare tweets data and send the response
	var replyWithTimeline = function(tweets, users) {
		var
			reply = { },
			tweetId;

		for (tweetId in tweets.items) {
			var
				tweet     = tweets.items[tweetId],
				user      = users.items[tweet.fields['user_id']],
				retweeted = tweet.fields['retweeted_user_id'] ? users.items[tweet.fields['retweeted_user_id']] : null;

			reply[tweet.fields['id']] = {
				'msg': tweet.fields['msg'],
				'user': user.getPart(['id', 'screen_name', 'avatar']),
				'retweeted': retweeted ? retweeted.getPart(['id', 'screen_name', 'avatar']) : null
			};
		}

		sendResponse( {
			'account': {
				'id': account.fields['id'],
				'name': account.user.fields['screen_name']
			},
			'data': reply
		} );
	};

	if (account) {
		// we need to get the homeTimeline if user is in out accounts
		twic.twitter.getHomeTimeline(id, replyWithTimeline, afterId);

		account.setValue('unread_tweets_count', 0);
		account.save();
	}
} );

twic.requests.subscribe('sendTweet', function(data, sendResponse) {
	// check for id in request data
	if (!data['id']) {
		sendResponse({ });
		return;
	}

	var
		id = data['id'],
		tweet = data['tweet'];

	twic.twitter.updateStatus(id, tweet, function() {
		sendResponse({ });
	} );
} );

twic.requests.subscribe('retweet', function(data, sendResponse) {
	// check for id in request data
	if (!data['userId']) {
		sendResponse({ });
		return;
	}

	var
		userId = data['userId'],
		tweetId = data['tweetId'];

	twic.twitter.retweet(userId, tweetId, function() {
		sendResponse({ });
	} );
} );

twic.requests.subscribe('delete', function(data, sendResponse) {
	// check for id in request data
	if (!data['userId']) {
		sendResponse({ });
		return;
	}

	var
		userId = data['userId'],
		tweetId = data['tweetId'];

	twic.twitter.deleteTweet(userId, tweetId, function() {
		sendResponse({ });
	} );
} );
