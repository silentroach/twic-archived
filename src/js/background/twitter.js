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
	var homeTimeline = function(id, callback) {
		var account = twic.accounts.getInfo(id);
		
		if (!account) {
			return;
		}
		
		twic.api.homeTimeline(id, account['oauth_token'], account['oauth_token_secret'], function(data) {
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
					userId = tweet['user']['id'];
					
				if (!(userId in users)) {
					users[userId] = tweet['user'];
				}
				
				var tweetObj = new twic.db.obj.Tweet();
				tweetObj.updateFromJSON(tweet['id'], tweet);
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
	};

	return {
		getUserInfo: getUserInfo,
		homeTimeline: homeTimeline
	};

} )();
