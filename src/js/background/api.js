twic.api = ( function(t) {

	var
		baseUrl = 'https://api.twitter.com/1/';

	/**
	 * Get the user info
	 * @param {number} id User identifier
	 * @param {function} callback Callback function
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
	
	/**
	 * Get user timeline
	 * @param {number} id User identifier
	 * @param {function} callback Callback function
	 */
	var homeTimeline = function(id, callback) {
		var req = new t.request('GET', baseUrl + 'statuses/home_timeline/' + id + '.json');
	
		console.info('home timeline');
	};

	return {
		userinfo: getUserInfo,
		homeTimeline: homeTimeline
	};

} )(twic);
