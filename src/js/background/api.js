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
		 * @type {boolean|number}
		 */
		ratelimit_remains = false,
		/**
		 * @type {boolean|number}
		 */
		ratelimit_reset = false,
		/**
		 * @type {boolean|string}
		 */
		oauth_token = false,
		/**
		 * @type {boolean|string}
		 */
		oauth_token_secret = false;

	/**
	 * Get the request limit values from request response headers
	 * @param {XMLHttpRequest} req
	 */
	var parseGlobalLimit = function(req) {
		var
			tmpRemains = req.getResponseHeader('X-RateLimit-Remaining'),
			tmpReset   = req.getResponseHeader('X-RateLimit-Reset');

		if (tmpRemains && tmpReset) {
			ratelimit_remains = tmpRemains;
			ratelimit_reset   = tmpReset;

			console.info('Ratelimit', ratelimit_remains, ratelimit_reset);
		}
	};
	
	/**
	 * Reset the request token after auth
	 */
	var resetToken = function() {
		oauth_token = false;
		oauth_token_secret = false;
	};

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
			var obj = twic.Request.convertDataToParams(r.responseText);

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
				callback(twic.Request.convertDataToParams(data.responseText));
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
			parseGlobalLimit(data);

			var obj = JSON.parse(data.responseText);

			if (obj) {
				callback(obj);
			}
		} );
	};

	/**
	 * Get user timeline
	 * @param {number} id User identifier
	 * @param {boolean|number} since_id Since id
	 * @param {string} token OAuth token
	 * @param {string} token_secret OAuth token secret
	 * @param {function(Array.<Object>)} callback Callback function
	 */
	var homeTimeline = function(id, since_id, token, token_secret, callback) {
		var req = new twic.OAuthRequest('GET', baseUrl + 'statuses/home_timeline/' + id + '.json');

		if (since_id) {
			req.setData('since_id', since_id);
		}

		req.sign(token, token_secret);
		
		console.info('updating home time line for ' + id + (since_id ? ' since id ' + since_id : ''));

		req.send( function(obj) {		
			var data = JSON.parse(obj.responseText);

			if (data) {
				callback(data);
			}
		} );
	};

	return {
		getRequestToken: getRequestToken,
		resetToken: resetToken,
		tryGrantAccess: tryGrantAccess,
		getAccessToken: getAccessToken,
		userinfo: getUserInfo,
		homeTimeline: homeTimeline
	};

} )();
