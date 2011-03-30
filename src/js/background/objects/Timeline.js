/**
 * Timeline database object
 *
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

twic.db.obj.Timeline = ( function() {

	var
		timeline = { };

	/**
	 * Push the tweet into user home timeline
	 * @param {number} userId User identifier
	 * @param {string} tweetId Tweet identifier
	 * @param {function()=} addCallback Callback function fired when item is saved
	 */
	timeline.pushUserTimelineTweet = function(userId, tweetId, addCallback) {
		twic.db.openQuery(
			'select user_id from timeline ' +
			'where user_id = ? and tweet_id = ? ' +
			'limit 1 ',
			[userId, tweetId],
			/**
			 * @this {SQLResultSetRowList}
			 */
			function() {
				var rows = this;

				if (rows.length > 0) {
					return;
				}

				twic.db.execQuery(
					'insert into timeline (user_id, tweet_id) ' +
					'values (?, ?) ',
					[userId, tweetId]
				);

				if (addCallback) {
					addCallback();
				}
			}
		);
	};

	return timeline;

}() );
