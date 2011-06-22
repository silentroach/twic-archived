/**
 * OAuth Request
 *
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

/**
 * @constructor
 * @extends twic.HTTPRequest
 * @param {string} method Method (GET, POST)
 * @param {string} url Url
 */
twic.OAuthRequest = function(method, url) {
	// call the parent constructor
	twic.HTTPRequest.call(this, method, url);
};

/**
 * Offset to correct the timestamp property
 * @type {number}
 */
twic.OAuthRequest.timestampOffset = 0;

goog.inherits(twic.OAuthRequest, twic.HTTPRequest);

/**
 * Get the random OAuth nonce
 * @return {string}
 */
twic.OAuthRequest.prototype.getNonce = function() {
	var
		/**
		 * Nonce charset for random string
		 * @const
		 */
		nonce_chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz',
		result = '',
		i;

	for (i = 0; i < 6; ++i) {
		result += nonce_chars[Math.floor(Math.random() * nonce_chars.length)];
	}

	return result;
};

/**
 * Sign the request
 * @param {string=} token OAuth token
 * @param {string=} token_secret OAuth token secret
 */
twic.OAuthRequest.prototype.sign = function(token, token_secret) {
	var
		self = this,
		baseString = self.method + '&' + self.encodeString(self.url) + '&',
		params = [],
		key;

	if (self.method !== 'GET') {
		self.setHeader('Content-Type', 'application/x-www-form-urlencoded');
	}

	self.setRequestServiceData('oauth_consumer_key', twic.consumer_key);
	self.setRequestServiceData('oauth_signature_method', 'HMAC-SHA1');
	self.setRequestServiceData('oauth_version', '1.0');
	self.setRequestServiceData('oauth_nonce', self.getNonce());
	self.setRequestServiceData('oauth_timestamp', twic.utils.date.getCurrentTimestamp() + twic.OAuthRequest.timestampOffset);

	if (token) {
		self.setRequestServiceData('oauth_token', token);
	}

	// encode the data
	for (key in self.data) {
		params.push(self.encodeString(key) + '=' + self.encodeString(self.data[key]));
	}

	for (key in self.serviceData) {
		params.push(self.encodeString(key) + '=' + self.encodeString(self.serviceData[key]));
	}

	// tis important to sort params
	baseString += self.encodeString(params.sort().join('&'));

	self.setRequestServiceData('oauth_signature',
		SHA1.encode(
			self.encodeString(twic.consumer_secret) + '&' + (token_secret ? self.encodeString(token_secret) : ''),
			baseString
		)
	);
};

/**
 * Send the request
 * @override
 * @param {function(?twic.ResponseError, ?XMLHttpRequest)} callback Callback
 */
twic.OAuthRequest.prototype.send = function(callback) {
	var checkOffsetAndCallback = function(error, req) {
		var
			inspectedRequest = req;

		if (
			!inspectedRequest
			&& twic.ResponseError.UNAUTHORIZED === error.code
		) {
			inspectedRequest = error.request;
		}

		if (inspectedRequest) {
			var
				i,
				checkHeader,
				newOffset,
				remoteDate,
				checkFields = ['Last-Modified', 'Date'];

			for (i = 0; i < checkFields.length; ++i) {
				checkHeader = inspectedRequest.getResponseHeader(checkFields[i]);

				if (
					!checkHeader
					|| !goog.isString(checkHeader)
				) {
					continue;
				}

				remoteDate = Date.parse(checkHeader);

				if (!remoteDate) {
					continue;
				}

				newOffset = twic.utils.date.getTimestamp(new Date(remoteDate)) - twic.utils.date.getCurrentTimestamp();

				if (twic.OAuthRequest.timestampOffset !== newOffset) {
					twic.OAuthRequest.timestampOffset = newOffset;

					if (error) {
						// change error to corrected to identify it later
						error.code = twic.ResponseError.CORRECTED;
					}

					twic.debug.log('OAuth timestamp offset is now ' + twic.OAuthRequest.timestampOffset);
				}
			}
		}

		callback(error, req);
	};

	// parent sender with own callback checker
	twic.HTTPRequest.prototype.send.call(this, checkOffsetAndCallback);
};
