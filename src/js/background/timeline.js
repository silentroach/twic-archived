/**
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

( function() {

	// listen for the "getTimeline" request
	twic.requests.subscribe('getTimeline', function(data, sendResponse) {
		// check for id in request data
		if (!data['id']) {
			sendResponse({ });
			return;
		}

		var
			id = data['id'],
			account = twic.accounts.getInfo(id);

		// prepare tweets data and send the response
		var replyWithTimeline = function(tweets, users) {
			var
				reply = { },
				tweetId;

			for (tweetId in tweets.items) {
				var
					tweet = tweets.items[tweetId],
					user  = users.items[tweet.fields['user_id']];

				reply[tweet.fields['id']] = {
					// todo add to DBObject method to extract only fields that we need
					'msg': tweet.fields['msg'],
					'user': {
						'id': user.fields['id'],
						'name': user.fields['screen_name'],
						'avatar': user.fields['avatar']
					}
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
			twic.twitter.getHomeTimeline(id, replyWithTimeline);

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

}() );
