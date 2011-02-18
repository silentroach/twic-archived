twic.twitter = ( function(t) {

	var getUserInfo = function(nick, callback) {
		t.db.readTransaction( function(tr) {
			tr.executeSql('select id from users where screen_name = ?', [nick], function(tr, res) {

			} );
		} );
	};

	/**
	 * Get user timeline
	 * @param {number} id User identifier
	 * @param {function} callback Callback function
	 */
	var timeline = function(id, callback) {

	};

	return {
		getUserInfo: getUserInfo,
		timeline: timeline
	};

} )(twic);
