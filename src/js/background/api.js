twic.api = ( function(t) {

	var
		baseUrl = 'https://api.twitter.com/1/';

	/**
	 * Get the user info
	 * @param {number} id User identifier
	 */
	var getUserInfo = function(id) {
		var req = new t.request('GET', baseUrl + 'users/show/' + id + '.json');
		req.send( function(data) {
			console.dir(JSON.parse(data.responseText));
		} );
	};

	return {
		userinfo: getUserInfo
	};

} )(twic);
