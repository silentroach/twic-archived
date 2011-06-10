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

	if (account) {
	    var
	        unreadCount = account.fields['unread_tweets_count'];
	
		// we need to get the homeTimeline if user is in out accounts
		twic.twitter.getHomeTimeline(id, function(tweets, users) {
		    // prepare tweets data and send the response
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
				    'retweeted': retweeted ? retweeted.getPart(['id', 'screen_name', 'avatar']) : null,
				    'separator': 0 === --unreadCount
			    };
		    }

		    sendResponse( {
			    'account': {
				    'id': account.fields['id'],
				    'name': account.user.fields['screen_name']
			    },
			    'data': reply
		    } );
	    }, afterId);

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

	twic.twitter.updateStatus(data['id'], data['tweet'], function() {
		sendResponse({ });
	} );
} );

twic.requests.subscribe('replyTweet', function(data, sendResponse) {
	// check for id in request data
	if (!data['id']) {
		sendResponse({ });
		return;
	}

	twic.twitter.replyStatus(data['id'], data['tweet'], data['replyTo'], function() {
		sendResponse({ });
	} );
} );

twic.requests.subscribe('retweet', function(data, sendResponse) {
	// check for id in request data
	if (!data['userId']) {
		sendResponse({ });
		return;
	}

	twic.twitter.retweet(data['userId'], data['tweetId'], function() {
		sendResponse({ });
	} );
} );

twic.requests.subscribe('delete', function(data, sendResponse) {
	// check for id in request data
	if (!data['userId']) {
		sendResponse({ });
		return;
	}

	twic.twitter.deleteTweet(data['userId'], data['tweetId'], function() {
		sendResponse({ });
	} );
} );
