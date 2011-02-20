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
		t.db.readTransaction( function(tr) {
			tr.executeSql('select id from users where screen_name = ?', [nick], function(tr, res) {

			} );
		} );
	};

	/**
	 * Get user timeline
	 * @param {number} id User identifier
	 * @param {function()} callback Callback function
	 */
	var timeline = function(id, callback) {

	};

	return {
		getUserInfo: getUserInfo,
		timeline: timeline
	};

} )();
