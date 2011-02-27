/**
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

/**
 * @constructor
 */
twic.OAuthRequest = function(method, url) {
	twic.OAuthRequest.superclass.constructor.call(this, method, url);
};

twic.utils.extend(twic.OAuthRequest, twic.Request);

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
		result = '';

	for (var i = 0; i < 6; ++i) {
		result += nonce_chars[Math.floor(Math.random() * nonce_chars.length)];
	}

	return result;
};

/**
 * Sign the request
 * @param {string} token OAuth token
 * @param {string} token_secret OAuth token secret
 */
twic.OAuthRequest.prototype.sign = function(token, token_secret) {
	var
		baseString = this.method + '&' + this.encodeString(this.url) + '&',
		params = [];

	if (this.method != 'GET') {
		this.setHeader('Content-Type', 'application/x-www-form-urlencoded');
	}

	this.setData('oauth_consumer_key', twic.consumer_key);
	this.setData('oauth_signature_method', 'HMAC-SHA1');
	this.setData('oauth_version', '1.0');
	this.setData('oauth_timestamp', twic.utils.getCurrentTimestamp());
	this.setData('oauth_nonce', this.getNonce());

	if (token) {
		this.setData('oauth_token', token);
	}

	b64pad = '=';

	for (var key in this.data) {
		params.push(this.encodeString(key) + '%3D' + this.encodeString(this.data[key]));
	}

	baseString += params.sort().join('%26');

	this.setData('oauth_signature',
		b64_hmac_sha1(this.encodeString(twic.consumer_secret) + '&' + (token_secret ? this.encodeString(token_secret) : ''), baseString)
	);
};
