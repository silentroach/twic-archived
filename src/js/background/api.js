/**
 * Something to work with Twitter API
 *
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

twic.api = { };

/**
 * @const
 * @type {string}
 */
twic.api.BASE_URL = 'https://api.twitter.com/1/';
/**
 * @const
 * @type {string}
 */
twic.api.AUTH_URL = 'https://api.twitter.com/oauth/';

/**
 * @type {boolean|number}
 * @private
 */
twic.api.ratelimit_remains_ = false;
/**
 * @type {boolean|number}
 * @private
 */
twic.api.ratelimit_reset_ = false;
/**
 * @type {?string}
 */
twic.api.oauth_token_;
/**
 * @type {?string}
 */
twic.api.oauth_token_secret_;

/**
 * Get the request limit values from request response headers
 * @param {XMLHttpRequest} req
 * @private
 */
twic.api.parseGlobalLimit_ = function(req) {
	var
		tmpRemains = req.getResponseHeader('X-RateLimit-Remaining'),
		tmpReset   = req.getResponseHeader('X-RateLimit-Reset');

	if (tmpRemains && tmpReset) {
		twic.api.ratelimit_remains_ = parseInt(tmpRemains, 10);
		twic.api.ratelimit_reset_   = parseInt(tmpReset, 10);

		twic.debug.info('Ratelimit', twic.api.ratelimit_remains_, twic.api.ratelimit_reset_);
	}
};

/**
 * Reset the request token after auth
 */
twic.api.resetToken = function() {
	twic.api.oauth_token_ = null;
	twic.api.oauth_token_secret_ = null;
};

/**
 * Get the app request token
 * @param {function(?string, ?string)} callback Callback function
 * @param {function(twic.ResponseError)=} failedCallback Failed callback function
 * @private
 */
twic.api.getRequestToken_ = function(callback, failedCallback) {
	if (twic.api.oauth_token_) {
		callback(twic.api.oauth_token_, twic.api.oauth_token_secret_);
		return;
	}

	var
		req = new twic.OAuthRequest('POST', twic.api.AUTH_URL + 'request_token');

	req.send( function(error, req) {
		if (!error) {
			var obj = twic.HTTPRequest.queryStringToObject(req.responseText);

			twic.api.oauth_token_        = obj['oauth_token'];
			twic.api.oauth_token_secret_ = obj['oauth_token_secret'];

			callback(twic.api.oauth_token_, twic.api.oauth_token_secret_);
		} else
		if (failedCallback) {
			failedCallback(error);
		}
	} );
};

/**
 * Open the access grant page to add accountAdd
 * @param {function()} callback Callback function for new tab is opened
 * @param {function()} failedCallback Callback function for fail
 */
twic.api.accountAdd = function(callback, failedCallback) {
	// we need to reset token to avoid an error when user closed a tab
	// and trying to authenticate the extension again
	twic.api.resetToken();

	twic.api.getRequestToken_( function(token, secret) {
		if (callback) {
			callback();
		}

		chrome.tabs.create( {
			'url': twic.api.AUTH_URL + 'authorize?oauth_token=' + token
		} );
	}, function() {
		if (failedCallback) {
			failedCallback();
		}
	} );
};

/**
 * Get the configuration
 * @param {function(*)} callback Callback function
 * @param {function(twic.ResponseError)=} failedCallback Failed callback function
 */
twic.api.getConfiruration = function(callback, failedCallback) {
	var
		req = new twic.HTTPRequest('GET', twic.api.BASE_URL + 'help/configuration.json');

	req.send( function(error, req) {
		if (!error) {
			var obj = JSON.parse(req.responseText);

			if (obj) {
				callback(obj);
			} // todo else failedCallback?
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
 * @param {function(twic.ResponseError)=} failedCallback Failed callback function
 */
twic.api.getAccessToken = function(pin, callback, failedCallback) {
	var req = new twic.OAuthRequest('POST', twic.api.AUTH_URL + 'access_token');
	req.setRequestData('oauth_verifier', pin);

	twic.api.getRequestToken_( function(token, secret) {
		req.send( function(error, req) {
			if (!error) {
				callback(
					twic.HTTPRequest.queryStringToObject(req.responseText)
				);
			} else {
				// reset the request_token if unauthorized reply is received
				if (error.code === twic.ResponseError.UNAUTHORIZED) {
					twic.debug.info('Unauthorized reply is received. Resetting request_token.');
					twic.api.resetToken();
				}

				if (failedCallback) {
					failedCallback(error);
				}
			}
		}, token, secret );
	} );
};

/**
 * Get the user info
 * @param {number|string} id User identifier or screen name
 * @param {function(Object)} callback Callback function
 * @param {function(twic.ResponseError)=} failedCallback Failed callback function
 */
twic.api.getUserInfo = function(id, callback, failedCallback) {
	var req = new twic.HTTPRequest('GET', twic.api.BASE_URL + 'users/show/' + id + '.json');

	req.setRequestData('include_entities', 1);

	req.send( function(error, req) {
		if (!error) {
			twic.api.parseGlobalLimit_(req);

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
twic.api.follow = function(whom_id, token, token_secret, callback) {
	var req = new twic.OAuthRequest('POST', twic.api.BASE_URL + 'friendships/create/' + whom_id + '.json');

	twic.debug.info('Following user ' + whom_id);

	req.send( function(error, req) {
		// todo what if it will fails?
		callback();
	}, token, token_secret );
};

/**
 * Unfollow user
 * @param {number} whom_id Whom to unfollow id
 * @param {string} token OAuth token
 * @param {string} token_secret OAuth token secret
 * @param {function()} callback Callback function
 */
twic.api.unfollow = function(whom_id, token, token_secret, callback) {
	var req = new twic.OAuthRequest('POST', twic.api.BASE_URL + 'friendships/destroy/' + whom_id + '.json');

	twic.debug.info('Unfollowing user ' + whom_id);

	req.send( function(error, req) {
		// todo what if it will fails?
		callback();
	}, token, token_secret );
};

/**
 * Retweet the status
 * @param {string} id Tweet identifier
 * @param {string} token OAuth token
 * @param {string} token_secret OAuth token secret
 * @param {function(*)} callback Callback function
 * @param {function(twic.ResponseError)=} failedCallback Failed callback function
 */
twic.api.retweet = function(id, token, token_secret, callback, failedCallback) {
	var req = new twic.OAuthRequest('POST', twic.api.BASE_URL + 'statuses/retweet/' + id + '.json');

	req.setRequestData('include_entities', 1);

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
	}, token, token_secret );
};

/**
 * Remove the tweet
 * @param {string} id Tweet identifier
 * @param {string} token OAuth token
 * @param {string} token_secret OAuth token secret
 * @param {function()} callback Callback function
 * @param {function(twic.ResponseError)=} failedCallback Failed callback function
 */
twic.api.deleteTweet = function(id, token, token_secret, callback, failedCallback) {
	var req = new twic.OAuthRequest('POST', twic.api.BASE_URL + 'statuses/destroy/' + id + '.json');

	// do not request additional user info cause it is about us
	req.setRequestData('trim_user', 1);

	twic.debug.info('Removing the ' + id);

	req.send( function(error, req) {
		if (!error) {
			callback();
		} else {
			failedCallback(error);
		}
	}, token, token_secret );
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
twic.api.homeTimeline = function(id, since_id, token, token_secret, callback, failedCallback) {
	var req = new twic.OAuthRequest('GET', twic.api.BASE_URL + 'statuses/home_timeline/' + id + '.json');

	req.setRequestData('include_entities', 1);

	if (since_id) {
		req.setRequestData('since_id', since_id);
	}

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
	}, token, token_secret );
};

/**
 * Get the friendship info
 * @param {number} source_id Source user identifier
 * @param {number} target_id Target user identifier
 * @param {function(*)} callback Callback function
 * @param {function(twic.ResponseError)=} failedCallback Failed callback function
 */
twic.api.getFriendshipInfo = function(source_id, target_id, callback, failedCallback) {
	var req = new twic.HTTPRequest('GET', twic.api.BASE_URL + 'friendships/show.json');
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
 * @param {Array|false} coords Tweet coordinates
 * @param {string} token OAuth token
 * @param {string} token_secret OAuth token secret
 * @param {function(*)} callback Callback function
 * @param {function(twic.ResponseError)=} failedCallback Failed callback function
 */
twic.api.updateStatus = function(status, coords, token, token_secret, callback, failedCallback) {
	var req = new twic.OAuthRequest('POST', twic.api.BASE_URL + 'statuses/update.json');

	req.setRequestData('include_entities', 1);
	req.setRequestData('status', status);

	// geoinfo
	if (coords) {
		req.setRequestData('lat', coords[0]);
		req.setRequestData('long', coords[1]);
	}

	// do not request additional user info cause it is about us
	req.setRequestData('trim_user', 1);

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
	}, token, token_secret );
};

/**
 * Update user status
 * @param {string} status New user status
 * @param {Array|false} coords Tweet coordinates
 * @param {string} replyTo Reply to tweet identifier
 * @param {string} token OAuth token
 * @param {string} token_secret OAuth token secret
 * @param {function(*)} callback Callback function
 * @param {function(twic.ResponseError)=} failedCallback Failed callback function
 */
twic.api.replyStatus = function(status, coords, replyTo, token, token_secret, callback, failedCallback) {
	var req = new twic.OAuthRequest('POST', twic.api.BASE_URL + 'statuses/update.json');

	req.setRequestData('include_entities', 1);
	req.setRequestData('in_reply_to_status_id', replyTo);
	req.setRequestData('status', status);

	// geoinfo
	if (coords) {
		req.setRequestData('lat', coords[0]);
		req.setRequestData('long', coords[1]);
	}

	// do not request additional user info cause it is about us
	req.setRequestData('trim_user', 1);

	twic.debug.info('sending the reply tweet: ' + status);

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
	}, token, token_secret );
};

