twic.oauth = ( function(t) {

	var 
		/**
		 * Consumer key for Twitter API
		 * @const
		 */
		consumer_key = 'Yda6L1lsEkqwDhcqxWPXtw',
		/**
		 * Consumer secret for Twitter API
		 * @const
		 */
		consumer_secret = 'IHtRC1kPwQ4MH1lccSaZGdhZPyPiw2iuEfhCDV4',
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
	 * @param {twic.request} req Request
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
		
		console.info(baseString);
	
		return b64_hmac_sha1(encode(consumer_secret) + '&', baseString);
	};
	
	/**
	 * Sign the request
	 * @param {twic.request} req Request
	 */
	var signRequest = function(req) {
		var dt  = new Date();
	
		req.setHeader('Content-Type', 'application/x-www-form-urlencoded');
	
		req.setData('oauth_consumer_key', consumer_key);
		req.setData('oauth_signature_method', 'HMAC-SHA1');
		req.setData('oauth_version', '1.0');
		req.setData('oauth_timestamp', Math.floor(dt.getTime() / 1000));
		req.setData('oauth_nonce', getNonce());
		req.setData('oauth_signature', getSignature(req));
	};
	
	/**
	 * Request the token
	 * @param {string} url Url
	 */
	var requestToken = function(url) {
		var req = new t.request('POST', url);
		signRequest(req);
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
		} );
	};

	return {
    sign: signRequest,
    requestToken: requestToken,
    getToken: function() {
    	return token;
    }
	};

} )(twic);