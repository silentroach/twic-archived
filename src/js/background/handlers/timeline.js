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
		options = { },
		account = twic.accounts.getInfo(id);

	if ('after' in data) {
		options['afterId'] = data['after'];
	} else
	if ('before' in data) {
		options['beforeId'] = data['before'];
	}

	if (account) {
		var
			unreadCount = account.fields['unread_tweets_count'];

		// we need to get the homeTimeline if user is in out accounts
		twic.twitter.getHomeTimeline(id, function(tweets, users) {
		    // prepare tweets data and send the response
		    var
			    reply = { },
			    ids = [],
			    tweetId = '';

		    for (tweetId in tweets.items) {
			    var
				    tweet     = tweets.items[tweetId],
				    user      = users.items[tweet.fields['user_id']],
				    retweeted = tweet.fields['retweeted_user_id'] ? users.items[tweet.fields['retweeted_user_id']] : null,
					tweetInfo = {
						'msg': tweet.fields['msg'],
						'user': user.getPart(['id', 'screen_name', 'avatar', 'is_protected']),
						'retweeted': retweeted ? retweeted.getPart(['id', 'screen_name', 'avatar', 'is_protected']) : null,
						'separator': 0 === --unreadCount,
						'dt': tweet.fields['dt'],
						'links': { 'length': 0 }
					};

			    if (twic.options.getValue('tweet_show_client')) {
			    	tweetInfo['source'] = tweet.fields['source'];
			    }

				if (
					tweet.fields['geo']
					&& twic.options.getValue('tweet_show_geo')
				) {
					tweetInfo['geo'] = tweet.fields['geo'].split(',');
				}

				ids.push('"' + tweetId + '"');
				reply[tweet.fields['id']] = tweetInfo;
		    }

		    var send = function() {
				  sendResponse( {
					  'account': {
						  'id': account.fields['id'],
						  'name': account.user.fields['screen_name']
					  },
					  'data': reply
				  } );
		    };

		    twic.db.openQuery('select * from links where tweet_id in (' + ids.join(',') + ')', [], function(rows) {
					var i;

					for (i = 0; i < rows.length; ++i) {
						var
							row = rows.item(i);

						reply[row['tweet_id']]['links'][row['lnk']] = row['expanded'];
						++reply[row['tweet_id']]['links']['length'];
					}

					send();
		    }, send );
	    }, options);

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
