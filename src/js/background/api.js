/**
 * Something to work with Twitter API
 *
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
		authUrl = 'https://api.twitter.com/oauth/',
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

			twic.debug.info('Ratelimit', ratelimit_remains, ratelimit_reset);
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
	 * @param {?function(twic.RequestError)} failedCallback Failed callback function
	 */
	var getRequestToken = function(callback, failedCallback) {
		if (oauth_token) {
			callback(oauth_token, oauth_token_secret);
			return;
		}

		var req = new twic.OAuthRequest('POST', authUrl + 'request_token');
		req.sign();

		req.send( function(error, req) {
			if (!error) {
				var obj = twic.Request.queryStringToObject(req.responseText);

				oauth_token        = obj['oauth_token'];
				oauth_token_secret = obj['oauth_token_secret'];

				callback(oauth_token, oauth_token_secret);
			} else
			if (failedCallback) {
				failedCallback(error);
			}
		} );
	};

	/**
	 * Get the user access token
	 * @param {string} pin Pin code
	 * @param {function(Object)} callback Callback function
	 * @param {?function(twic.RequestError)} failedCallback Failed callback function
	 */
	var getAccessToken = function(pin, callback, failedCallback) {
		var req = new twic.OAuthRequest('POST', authUrl + 'access_token');
		req.setRequestData('oauth_verifier', pin);

		getRequestToken( function(token, secret) {
			req.sign(token, secret);

			req.send( function(error, req) {
				if (!error) {
					callback(twic.Request.queryStringToObject(req.responseText));
				} else {
					// reset the request_token if unauthorized reply is received
					if (error.code === twic.ResponseError.UNAUTHORIZED) {
						twic.debug.info('Unauthorized reply is received. Resetting request_token.');
						resetToken();
					}

					if (failedCallback) {
						failedCallback(error);
					}
				}
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
	 * @param {number|string} id User identifier or screen name
	 * @param {function()} callback Callback function
	 * @param {?function(twic.RequestError)} failedCallback Failed callback function
	 */
	var getUserInfo = function(id, callback, failedCallback) {
		var req = new twic.Request('GET', baseUrl + 'users/show/' + id + '.json');
		req.send( function(error, req) {
			if (!error) {
				parseGlobalLimit(req);

				var obj = JSON.parse(req.responseText);

				if (obj) {
					callback(obj);
				} // todo else failedCallback
			} else
			if (failedCallback) {
				failedCallback(error);
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
	 * @param {?function(twic.RequestError)} failedCallback Failed callback function
	 */
	var homeTimeline = function(id, since_id, token, token_secret, callback, failedCallback) {
		var req = new twic.OAuthRequest('GET', baseUrl + 'statuses/home_timeline/' + id + '.json');

		if (since_id) {
			req.setRequestData('since_id', since_id);
		}

		req.sign(token, token_secret);

		twic.debug.info('updating home time line for ' + id + (since_id ? ' since id ' + since_id : ''));

		req.send( function(error, req) {
			if (!error) {
				var data = JSON.parse(req.responseText);

				if (
					data
					&& callback
				) {
					callback(data);
				}
			} else
			if (failedCallback) {
				failedCallback(error);
			}
		} );
	};

	/**
	 * Update user status
	 * @param {string} status New user status
	 * @param {string} token OAuth token
	 * @param {string} token_secret OAuth token secret
	 * @param {function(Array.<Object>)} callback Callback function
	 * @param {?function(twic.RequestError)} failedCallback Failed callback function
	 */
	var updateStatus = function(status, token, token_secret, callback, failedCallback) {
		var req = new twic.OAuthRequest('POST', baseUrl + 'statuses/update.json');

		req.setRequestData('status', status);

		// do not request additional user info cause it is about us
		req.setRequestData('trim_user', 1);

		req.sign(token, token_secret);

		twic.debug.info('sending the new tweet: ' + status);

		req.send( function(error, req) {
			if (!error) {
				var data = JSON.parse(req.responseText);

				if (
					data
					&& callback
				) {
					callback(data);
				} // todo else failedCallback
			} else
			if (failedCallback) {
				failedCallback(error);
			}
		} );
	};

	// todo reorder, rename and comment
	return {
		getRequestToken: getRequestToken,
		resetToken: resetToken,
		tryGrantAccess: tryGrantAccess,
		getAccessToken: getAccessToken,
		getUserInfo: getUserInfo,
		homeTimeline: homeTimeline,
		updateStatus: updateStatus
	};

}() );

