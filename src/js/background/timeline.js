/**
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

( function() {

	twic.requests.subscribe('getTimeline', function(data, sendResponse) {
		if (!('id' in data)) {
			sendResponse({ });
			return;
		}

		var
			id = data['id'],
			account = twic.accounts.getInfo(id);
			
		var replyWithTimeline = function(tweets, users) {
			var reply = { };

			for (var tweetId in tweets.items) {
				var 
					tweet = tweets.items[tweetId],
					user  = users.items[tweet.fields['user_id']];
				
				reply[tweet.fields['id']] = {
					'msg': tweet.fields['msg'],
					'user': {
						'id': user.fields['id'],
						'name': user.fields['screen_name'],
						'avatar': user.fields['avatar']
					}
				};
			}

			sendResponse(reply);
		};

		if (account) {
			twic.twitter.getHomeTimeline(id, replyWithTimeline);
			
			account.setValue('unread_tweets_count', 0);
			account.save();
		}
	} );

} )();
