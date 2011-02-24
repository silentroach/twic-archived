/**
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */
 
/**
 * @constructor
 */
twic.OAuthRequest = function(method, url) {
	twic.OAuthRequest.superclass.constructor.call(this, method, url);
}

twic.extend(twic.OAuthRequest, twic.Request);

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
		dt = new Date(),
		baseString = this.method + '&' + this.encodeString(this.url) + '&',
		params = [];

	this.setHeader('Content-Type', 'application/x-www-form-urlencoded');

	this.setData('oauth_consumer_key', twic.consumer_key);
	this.setData('oauth_signature_method', 'HMAC-SHA1');
	this.setData('oauth_version', '1.0');
	this.setData('oauth_timestamp', Math.floor(dt.getTime() / 1000));
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
}

//

twic.oauth = ( function() {

	var 
		/**
		 * OAuth-token
		 * @type {string}
		 */
		token = '',
		/**
		 * OAuth-token secret
		 * @type {string}
		 */
		token_secret = '',
		/**
		 * OAuth-token requested
		 * @type {boolean}
		 */
		token_requested = false,
		/**
		 * Nonce charset for random string
		 * @const
		 */
		nonce_chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz';

	/**
	 * Get the random OAuth nonce
	 * @return {string}
	 */
	var getNonce = function() {
		var result = '';
		
		for (var i = 0; i < 6; ++i) {	
			result += nonce_chars[Math.floor(Math.random() * nonce_chars.length)];
		}
		
		return result;
	};
	
	/**
	 * Encode the string
	 * @param {string} str String
	 * @return {string}
	 */
	var encode = function(str) {
		var result = encodeURIComponent(str);
		
		result = result.replace(/\!/g, '%21');
		result = result.replace(/\*/g, '%2A');
		result = result.replace(/\'/g, '%27');
		result = result.replace(/\(/g, '%28');
		result = result.replace(/\)/g, '%29');
		
		return result;
	};
	
	/**
	 * Get the request signature
	 * @param {twic.Request} req Request
	 * @return {string} Signature
	 */
	var getSignature = function(req) {
		b64pad = '=';
		
		var 
			baseString = req.method + '&' + encode(req.url) + '&',
			params = [];
		
		for (var key in req.data) {
			params.push(encode(key) + '%3D' + encode(req.data[key]));
		}
		
		baseString += params.sort().join('%26');
	
		return b64_hmac_sha1(encode(twic.consumer_secret) + '&' + (token_requested ? encode(token_secret) : ''), baseString);
	};
	
	/**
	 * Add signature to method
	 * @param {twic.Request} req Request
	 */
	var sign = function(req) {
		req.setData('oauth_signature', getSignature(req));	
	};
	
	/**
	 * Prepare the request
	 * @param {twic.Request} req Request
	 */
	var prepareRequest = function(req) {
		var dt = new Date();
	
		req.setHeader('Content-Type', 'application/x-www-form-urlencoded');
	
		req.setData('oauth_consumer_key', twic.consumer_key);
		req.setData('oauth_signature_method', 'HMAC-SHA1');
		req.setData('oauth_version', '1.0');
		req.setData('oauth_timestamp', Math.floor(dt.getTime() / 1000));
		req.setData('oauth_nonce', getNonce());
	};
	
	/**
	 * Request the token
	 * @param {function(string, string)} callback Callback function
	 */
	var requestToken = function(callback) {
		if (token_requested) {
			callback(token, token_secret);
			return;
		}
	
		var req = new twic.Request('POST', 'https://twitter.com/oauth/request_token');
		
		prepareRequest(req);
		sign(req);
		
		req.send( function(result) {
			var data = result.responseText.split('&');
			
			data.forEach( function(element) {
				var v = element.split('=');
				
				if (v.length != 2) {
					return;
				}
				
				if (v[0] == 'oauth_token') {
					token = v[1];
				} else
				if (v[0] == 'oauth_token_secret') {
					token_secret = v[1];
				}
			} );
			
			token_requested = true;
			
			callback(token, token_secret);
		} );
	};
	
	/**
	 * Sign the request
	 * @param {twic.Request} req Request
	 * @param {function(twic.Request)} callback Callback function
	 */
	var signRequest = function(req, callback) {
		prepareRequest(req);
		
		requestToken( function(t, ts) {
			req.setData('oauth_token', t);
			
			sign(req);
			
			callback(req);
		} );
	};

	return {
		sign: signRequest,
		getRequestToken: requestToken
	};

} )();
