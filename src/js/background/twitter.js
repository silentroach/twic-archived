/**
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

/**
 * Something between application and "raw" api
 */
twic.twitter = ( function() {

	var
		/**
		 * User identifier => last home timeline tweet identifier
		 * @type {Object.<number,string>}
		 */
		cachedLastId = { };

	/**
	 * Get the user info
	 * @param {string} nick Nickname
	 * @param {function(Object)} callback Callback function
	 */
	var getUserInfo = function(nick, callback) {
		var
			tmpUser = new twic.db.obj.User();

		tmpUser.loadByFieldValue(
			'screen_name', nick,
			function() {
				callback(tmpUser);
			},
			function() {
				twic.api.getUserInfo(nick, function(obj) {
					tmpUser.loadFromJSON(obj);
					tmpUser.save();

					callback(tmpUser);
				} );
			}
		);
	};

	/**
	 * Get user timeline
	 * @param {number} id User identifier
	 * @param {function(twic.DBObjectList,twic.DBObjectList)} callback Callback function
	 */
	var getHomeTimeline = function(id, callback) {
		var
			tmpTweet = new twic.db.obj.Tweet(),
			tmpUser  = new twic.db.obj.User();

		twic.db.select(
			'select ' + tmpTweet.getFieldString('t') + ', ' + tmpUser.getFieldString('u') + ' ' +
			'from tweets t ' +
				'inner join timeline tl on (t.id = tl.tweet_id) ' +
				'inner join users u on (t.user_id = u.id) ' +
			'where tl.user_id = ? ' +
			'order by t.id desc limit 20 ',
			[id],
			function() {
				var
					rows = this,
					tweetList = new twic.DBObjectList(twic.db.obj.Tweet),
					userList  = new twic.DBObjectList(twic.db.obj.User),
					i;

				for (i = 0; i <rows.length; ++i) {
					var row = rows.item(i);

					tweetList.pushUnique(row, 't');
					userList.pushUnique(row, 'u');
				}

				callback(tweetList, userList);
			}
		);
	};

	/**
	 * Update the user status
	 * @param {number} id User identifier
	 * @param {string} status New status text
	 * @param {function()} callback Callback function
	 */
	var updateStatus = function(id, status, callback) {
		var account = twic.accounts.getInfo(id);

		if (!account) {
			return;
		}

		// FIXME get all the new messages before send

		twic.api.updateStatus(
			status,
			account.fields['oauth_token'], account.fields['oauth_token_secret'],
			function(tweet) {
				var
					/** @type {string} **/ tweetId = tweet['id_str'],
					tweetObj = new twic.db.obj.Tweet();

				tweetObj.updateFromJSON(tweetId, tweet);

				twic.db.obj.Timeline.pushUserTimelineTweet(id, tweetId, callback);
			}
		);
	};

	/**
	 * Update user home timeline
	 * @param {number} userId User identifier
	 * todo method is too big. maybe we need to refactor it.
	 */
	var updateHomeTimeline = function(userId) {
		var account = twic.accounts.getInfo(userId);

		if (!account) {
			// it is not our account. wtf?
			twic.debug.error('Can\'t find account in updateHomeTimeline', userId);
			return false;
		}

		var updateSinceId = function(since_id) {
			// try to get the home timeline from api
			twic.api.homeTimeline(
				userId, since_id,
				account.fields['oauth_token'], account.fields['oauth_token_secret'],
				function(data) {
					var
						users = [],
						i,
						tweetUserId;

					if (data.length === 0) {
						// no updates
						return;
					}

					var incrementUnreadTweets = function() {
						// increment the unread tweets count if it is new
						// todo think about doing it only once per timeline update
						account.setValue('unread_tweets_count', account.fields['unread_tweets_count'] + 1);
						account.save();
					};

					for (i = 0; i < data.length; ++i) {
						var
							/** @type {Object} */ tweet   = data[i],
							/** @type {string} */ tweetId = tweet['id_str'];

						// todo check tweet direction
						cachedLastId[userId] = tweetId;

						tweetUserId = tweet['user']['id'];

						// add the user to check it after
						if (!users[tweetUserId]) {
							users[tweetUserId] = tweet['user'];
						}

						// the same thing for retweeted_status.user if it is retweet
						if (
							tweet['retweeted_status']
							&& !users[tweet['retweeted_status']['user']['id']]
						) {
							users[tweet['retweeted_status']['user']['id']] = tweet['retweeted_status']['user'];
						}

						var tweetObj = new twic.db.obj.Tweet();
						tweetObj.updateFromJSON(tweetId, tweet);

						twic.db.obj.Timeline.pushUserTimelineTweet(
							userId, tweetId,
							// only increment the unread tweets count if tweet user id isn't me
							tweetUserId !== userId ? incrementUnreadTweets : undefined
						);
					}

					// trying to save all the new users
					for (tweetUserId in users) {
						var
							 /**
							 * @type {Object}
							 */
							user = users[tweetUserId];

						var userObj = new twic.db.obj.User();
						userObj.updateFromJSON(tweetUserId, user);
					}
				}
			);
		};

		if (
			cachedLastId[userId]
		) {
			updateSinceId(cachedLastId[userId]);
		} else {
		// we need to find the last tweet id not to fetch the all timeline from api
			twic.db.select(
				'select t.id ' +
				'from tweets t inner join timeline tl on (t.id = tl.tweet_id) ' +
				'where tl.user_id = ? order by t.id desc limit 1 ', [userId],
				function() {
					var
						rows = this,
						since_id = false;

					if (rows.length > 0) {
						// nice to see you, since_id
						since_id = rows.item(0)['id'];
					}

					updateSinceId(since_id);

					cachedLastId[userId] = since_id;
				}
			);
		}
	};

	return {
		// getters
		getUserInfo: getUserInfo,
		getHomeTimeline: getHomeTimeline,

		// updaters
		updateHomeTimeline: updateHomeTimeline,
		updateStatus: updateStatus
	};

}() );

