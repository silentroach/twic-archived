twic.twitter = ( function(t) {

	var getUserInfo = function(nick, callback) {
		t.db.readTransaction( function(tr) {
			tr.executeSql('select id from users where screen_name = ?', [nick], function(tr, res) {
			
			} );
		} );
	};

	return {
		getUserInfo: getUserInfo
	};

} )(twic);
