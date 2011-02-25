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
			id = data['id'];

		twic.twitter.getHomeTimeline(id, function(tweets, users) {
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
		} );
	} );

} )();
