/**
 * Something to work with Twitter API
 *
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

twic.api = ( function() {

	var
		api = { },
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
		 * @type {?string}
		 */
		oauth_token,
		/**
		 * @type {?string}
		 */
		oauth_token_secret;

	/**
	 * Get the request limit values from request response headers
	 * @param {XMLHttpRequest} req
	 */
	var parseGlobalLimit = function(req) {
		var
			tmpRemains = req.getResponseHeader('X-RateLimit-Remaining'),
			tmpReset   = req.getResponseHeader('X-RateLimit-Reset');

		if (tmpRemains && tmpReset) {
			ratelimit_remains = parseInt(tmpRemains, 10);
			ratelimit_reset   = parseInt(tmpReset, 10);

			twic.debug.info('Ratelimit', ratelimit_remains, ratelimit_reset);
		}
	};

	/**
	 * Reset the request token after auth
	 */
	api.resetToken = function() {
		oauth_token = null;
		oauth_token_secret = null;
	};

	/**
	 * Get the app request token
	 * @param {function(?string, ?string)} callback Callback function
	 * @param {function(twic.ResponseError)=} failedCallback Failed callback function
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
				var obj = twic.HTTPRequest.queryStringToObject(req.responseText);

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
	 * Open the access grant page to add accountAdd
	 */
	api.accountAdd = function() {
		getRequestToken( function(token, secret) {
			chrome.tabs.create( {
				'url': authUrl + 'authorize?oauth_token=' + token
			} );
		} );
	};

	/**
	 * Get the user access token
	 * @param {string} pin Pin code
	 * @param {function(Object)} callback Callback function
	 * @param {function(twic.ResponseError)=} failedCallback Failed callback function
	 */
	api.getAccessToken = function(pin, callback, failedCallback) {
		var req = new twic.OAuthRequest('POST', authUrl + 'access_token');
		req.setRequestData('oauth_verifier', pin);

		getRequestToken( function(token, secret) {
			req.sign(token, secret);

			req.send( function(error, req) {
				if (!error) {
					callback(
						twic.HTTPRequest.queryStringToObject(req.responseText)
					);
				} else {
					// reset the request_token if unauthorized reply is received
					if (error.code === twic.ResponseError.UNAUTHORIZED) {
						twic.debug.info('Unauthorized reply is received. Resetting request_token.');
						api.resetToken();
					}

					if (failedCallback) {
						failedCallback(error);
					}
				}
			} );
		} );
	};

	/**
	 * Get the user info
	 * @param {number|string} id User identifier or screen name
	 * @param {function(*)} callback Callback function
	 * @param {function(twic.ResponseError)=} failedCallback Failed callback function
	 */
	api.getUserInfo = function(id, callback, failedCallback) {
		var req = new twic.HTTPRequest('GET', baseUrl + 'users/show/' + id + '.json');
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
	 * Follow user
	 * @param {number} whom_id Whom to follow id
	 * @param {string} token OAuth token
	 * @param {string} token_secret OAuth token secret
	 * @param {function()} callback Callback function
	 */
	api.follow = function(whom_id, token, token_secret, callback) {
		var req = new twic.OAuthRequest('POST', baseUrl + 'friendships/create/' + whom_id + '.json');

		req.sign(token, token_secret);

		twic.debug.info('Following user ' + whom_id);

		req.send( function(error, req) {
			// todo what if it will fails?
			callback();
		} );
	};

	/**
	 * Retweet the status
	 * @param {string} id Tweet identifier
	 * @param {string} token OAuth token
	 * @param {string} token_secret OAuth token secret
	 * @param {function(*)} callback Callback function
	 * @param {function(twic.ResponseError)=} failedCallback Failed callback function
	 */
	api.retweet = function(id, token, token_secret, callback, failedCallback) {
		var req = new twic.OAuthRequest('POST', baseUrl + 'statuses/retweet/' + id + '.json');

		req.sign(token, token_secret);

		twic.debug.info('Retweeting the ' + id);

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

	/**
	 * Unfollow user
	 * @param {number} whom_id Whom to unfollow id
	 * @param {string} token OAuth token
	 * @param {string} token_secret OAuth token secret
	 * @param {function()} callback Callback function
	 */
	api.unfollow = function(whom_id, token, token_secret, callback) {
		var req = new twic.OAuthRequest('POST', baseUrl + 'friendships/destroy/' + whom_id + '.json');

		req.sign(token, token_secret);

		twic.debug.info('Unfollowing user ' + whom_id);

		req.send( function(error, req) {
			// todo what if it will fails?
			callback();
		} );
	};

	/**
	 * Get user timeline
	 * @param {number} id User identifier
	 * @param {?string} since_id Since id
	 * @param {string} token OAuth token
	 * @param {string} token_secret OAuth token secret
	 * @param {function(*)} callback Callback function
	 * @param {function(twic.ResponseError)=} failedCallback Failed callback function
	 */
	api.homeTimeline = function(id, since_id, token, token_secret, callback, failedCallback) {
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
	 * Get the friendship info
	 * @param {number} source_id Source user identifier
	 * @param {number} target_id Target user identifier
	 * @param {function(*)} callback Callback function
	 * @param {function(twic.ResponseError)=} failedCallback Failed callback function
	 */
	api.getFriendshipInfo = function(source_id, target_id, callback, failedCallback) {
		var req = new twic.HTTPRequest('GET', baseUrl + 'friendships/show.json');
		req.setRequestData('source_id', source_id);
		req.setRequestData('target_id', target_id);

		twic.debug.info('updating friendship status for ' + source_id + ' -> ' + target_id);

		req.send( function(error, req) {
			if (!error) {
				var data = JSON.parse(req.responseText);

				if (
					data
					&& data['relationship']
					&& data['relationship']['source']
					&& callback
				) {
					callback(data['relationship']);
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
	 * @param {function(*)} callback Callback function
	 * @param {function(twic.ResponseError)=} failedCallback Failed callback function
	 */
	api.updateStatus = function(status, token, token_secret, callback, failedCallback) {
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

	return api;

}() );
