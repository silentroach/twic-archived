twic.api = ( function(t) {

	var
		baseUrl = 'https://api.twitter.com/1/';

	/**
	 * Get the user info
	 * @param {number} id User identifier
	 */
	var getUserInfo = function(id, callback) {
		var req = new t.request('GET', baseUrl + 'users/show/' + id + '.json');
		req.send( function(data) {
			var obj = JSON.parse(data.responseText);
			
			if (obj) {
				callback(obj);
			}
		} );
	};

	return {
		userinfo: getUserInfo
	};

} )(twic);
