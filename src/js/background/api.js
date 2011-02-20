/**
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

twic.api = ( function() {

	var
		baseUrl = 'https://api.twitter.com/1/';

  /**
   * Get the user access token
   * @param {string} pin Pin code
   * @param {function(Object)} callback Callback function
   */
  var getAccessToken = function(pin, callback) {
		var req = new twic.request('POST', 'https://twitter.com/oauth/access_token');
		req.setData('oauth_verifier', pin);
		
		twic.oauth.sign(req, function(req) {
		  req.send( function(data) {		    
		    callback(convertDataToParams(data.responseText));
		  } );
		} );
  };

	/**
	 * Get the user info
	 * @param {number} id User identifier
	 * @param {function()} callback Callback function
	 */
	var getUserInfo = function(id, callback) {
		var req = new twic.request('GET', baseUrl + 'users/show/' + id + '.json');
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
	 * @param {function()} callback Callback function
	 */
	var homeTimeline = function(id, callback) {
		var req = new twic.request('GET', baseUrl + 'statuses/home_timeline/' + id + '.json');
	
		console.info('home timeline');
	};

	return {
	  accessToken: getAccessToken,
		userinfo: getUserInfo,
		homeTimeline: homeTimeline
	};

} )();
