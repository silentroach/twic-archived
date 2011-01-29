/*
https://twitter.com/oauth/request_token

oauth_consumer_key:consumer_key
oauth_signature_method:HMAC-SHA1
oauth_version:1.0
oauth_timestamp:1296329812
oauth_nonce:random string
oauth_signature:sha1-signature
*/

twic.oauth = ( function() {

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

	return {
    
	};

} )(twic);
