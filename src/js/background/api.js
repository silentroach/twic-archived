/**
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

twic.api = ( function() {

	var
		/**
		 * @const
		 * @type {string}
		 */
		baseUrl = 'https://api.twitter.com/1/',
		/**
		 * @const
		 * @type {string}
		 */
		authUrl = 'https://twitter.com/oauth/',
		/**
		 * @type {boolean|string}
		 */
		oauth_token = false,
		/**
		 * @type {boolean|string}
		 */		
		oauth_token_secret = false;

	/**
	 * Get the app request token
	 * @param {function(string, string)} callback Callback function
	 */
	var getRequestToken = function(callback) {
		if (oauth_token) {
			callback(oauth_token, oauth_token_secret);
			return;
		}
	
		var req = new twic.OAuthRequest('POST', authUrl + 'request_token');
		req.sign();

		req.send( function(r) {
			var obj = convertDataToParams(r.responseText);
			
			// FIXME check
			oauth_token        = obj['oauth_token'];
			oauth_token_secret = obj['oauth_token_secret'];

			callback(oauth_token, oauth_token_secret);
		} );
	};

	/**
	 * Get the user access token
	 * @param {string} pin Pin code
	 * @param {function(Object)} callback Callback function
	 */
	var getAccessToken = function(pin, callback) {
		var req = new twic.OAuthRequest('POST', authUrl + 'access_token');
		req.setData('oauth_verifier', pin);
		
		getRequestToken( function(token, secret) {
			req.sign(token, secret);
		
			req.send( function(data) {		    
				callback(convertDataToParams(data.responseText));
			} );
		} );
	};
	
	/**
	 * Open the new tab with user request to confirm the access
	 * @param {string} token OAuth token
	 */
	var tryGrantAccess = function(token) {
		chrome.tabs.create( {
			'url': 'https://api.twitter.com/oauth/authorize?oauth_token=' + token
		} );
	};
	
	/**
	 * Get the user info
	 * @param {number} id User identifier
	 * @param {function()} callback Callback function
	 */
	var getUserInfo = function(id, callback) {
		var req = new twic.Request('GET', baseUrl + 'users/show/' + id + '.json');
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
	 * @param {string} token OAuth token
	 * @param {string} token_secret OAuth token secret
	 * @param {function()} callback Callback function
	 */
	var homeTimeline = function(id, token, token_secret, callback) {
		var req = new twic.OAuthRequest('GET', baseUrl + 'statuses/home_timeline/' + id + '.json');
		req.sign(token, token_secret);
		
		req.send( function(obj) {
			console.dir(JSON.parse(obj.responseText));
		} );
	
		console.info('home timeline');
	};

	return {
		getRequestToken: getRequestToken,
		tryGrantAccess: tryGrantAccess,
		getAccessToken: getAccessToken,
		userinfo: getUserInfo,
		homeTimeline: homeTimeline
	};

} )();
