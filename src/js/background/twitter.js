/**
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

twic.twitter = ( function() {

	/**
	 * Get the user info
	 * @param {string} nick Nickname
	 * @param {function()} callback Callback function
	 */
	var getUserInfo = function(nick, callback) {
		twic.db.readTransaction( function(tr) {
			tr.executeSql('select id from users where screen_name = ?', [nick], function(tr, res) {

			} );
		} );
	};

	/**
	 * Get user timeline
	 * @param {number} id User identifier
	 * @param {function()} callback Callback function
	 */
	var getHomeTimeline = function(id, callback) {

	};

	/**
	 * Update user home timeline
	 * @param {number} id User identifier
	 */
	var updateHomeTimeline = function(id) {
		var account = twic.accounts.getInfo(id);

		if (!account) {
			return;
		}

		twic.db.readTransaction( function(tr) {
			tr.executeSql(
				'select t.id ' + 
				'from tweets t inner join timeline tl on (t.id = tl.tweet_id) ' +
				'where tl.user_id = ? order by t.id desc limit 1 ', [id],
				function(tr, res) {
					var since_id = false;

					if (res.rows.length > 0) {
						since_id = res.rows.item(0)['id'];
					}

					twic.api.homeTimeline(id, since_id, account['oauth_token'], account['oauth_token_secret'], function(data) {
						var users = [];

						for (var i = 0; i < data.length; ++i) {
							var
								/**
								 * @type {Object}
								 */
								tweet = data[i],
								/**
								 * @type {number}
								 */
								tweetId = tweet['id'],
								/**
								 * @type {number}
								 */
								userId = tweet['user']['id'];

							if (!(userId in users)) {
								users[userId] = tweet['user'];
							}

							var tweetObj = new twic.db.obj.Tweet();
							tweetObj.updateFromJSON(tweetId, tweet);
							
							twic.db.obj.Timeline.pushUserTimelineTweet(id, tweetId);
						}

						for (var userId in users) {
							var
								/**
								 * @type {Object}
								 */
								user = users[userId];

							var userObj = new twic.db.obj.User();
							userObj.updateFromJSON(userId, user);
						}
					} );
				}
			);
		} );
	};

	return {
		// getters
		getUserInfo: getUserInfo,
		getHomeTimeline: getHomeTimeline,

		// updaters
		updateHomeTimeline: updateHomeTimeline
	};

} )();
