/**
 * @preserve A JavaScript implementation of the Secure Hash Algorithm, SHA-1, as defined
 * in FIPS PUB 180-1
 * Version 2.1a Copyright Paul Johnston 2000 - 2002.
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 * Distributed under the BSD License
 * See http://pajhome.org.uk/crypt/md5 for details.
 * Modified by Kalashnikov Igor
 */

var SHA1 = ( function() {

	/**
	 * Configurable variables. You may need to tweak these to be compatible with
	 * the server-side, but the defaults work in most cases.
	 */
	var
		/** @const **/ chrsz = 8;  /* bits per input character. 8 - ASCII; 16 - Unicode */

	/**
	 * Determine the appropriate additive constant for the current iteration
	 */
	var sha1_kt = function(t) {
		return (t < 20) ?  1518500249 : (t < 40) ? 1859775393 : (t < 60) ? -1894007588 : -899497514;
	};

	/**
	 * Calculate the SHA-1 of an array of big-endian words, and a bit length
	 */
	var core_sha1 = function(x, len) {
		/* append padding */
		x[len >> 5] |= 0x80 << (24 - len % 32);
		x[((len + 64 >> 9) << 4) + 15] = len;

		var
			w = new Array(80),
			a =  1732584193,
			b = -271733879,
			c = -1732584194,
			d =  271733878,
			e = -1009589776,
			i;

		/**
		 * Perform the appropriate triplet combination function for the current
		 * iteration
		 */
		var sha1_ft = function(t, b, c, d) {
			if (t < 20) {
				return (b & c) | ((~b) & d);
			}

			if (t < 40) {
				return b ^ c ^ d;
			}

			if (t < 60) {
				return (b & c) | (b & d) | (c & d);
			}

			return b ^ c ^ d;
		};

		/**
		 * Add integers, wrapping at 2^32. This uses 16-bit operations internally
		 * to work around bugs in some JS interpreters.
		 */
		var safe_add = function(x, y) {
			var
				lsw = (x & 0xFFFF) + (y & 0xFFFF),
				msw = (x >> 16) + (y >> 16) + (lsw >> 16);

			return (msw << 16) | (lsw & 0xFFFF);
		};

		/**
		 * Bitwise rotate a 32-bit number to the left.
		 */
		var rol = function(num, cnt) {
			return (num << cnt) | (num >>> (32 - cnt));
		};

		for(i = 0; i < x.length; i += 16) {
			var
				olda = a,
				oldb = b,
				oldc = c,
				oldd = d,
				olde = e,
				j;

			for (j = 0; j < 80; j++) {
				if (j < 16) {
					w[j] = x[i + j];
				} else {
					w[j] = rol(w[j-3] ^ w[j-8] ^ w[j-14] ^ w[j-16], 1);
				}

				var
					t = safe_add(safe_add(rol(a, 5), sha1_ft(j, b, c, d)),
		                   safe_add(safe_add(e, w[j]), sha1_kt(j)));

				e = d;
				d = c;
				c = rol(b, 30);
				b = a;
				a = t;
			}

			a = safe_add(a, olda);
			b = safe_add(b, oldb);
			c = safe_add(c, oldc);
			d = safe_add(d, oldd);
			e = safe_add(e, olde);
		}

		return new Array(a, b, c, d, e);
	};

	/**
	 * Convert an 8-bit or 16-bit string to an array of big-endian words
	 * In 8-bit function, characters >255 have their hi-byte silently ignored.
	 * @param {string} str String
	 * @return {Array}
	 */
	var str2binb = function(str) {
		var
			bin = [],
			mask = (1 << chrsz) - 1,
			i;

		for(i = 0; i < str.length * chrsz; i += chrsz) {
			bin[i>>5] |= (str.charCodeAt(i / chrsz) & mask) << (32 - chrsz - i%32);
		}

		return bin;
	};

	/**
	 * Calculate the HMAC-SHA1 of a key and some data
	 * @param {string} key Key
	 * @param {string} data Data
	 * @return {string}
	 */
	var core_hmac_sha1 = function(key, data) {
		var
			bkey = str2binb(key),
			ipad = new Array(16),
			opad = new Array(16),
			i;

		if (bkey.length > 16) {
			bkey = core_sha1(bkey, key.length * chrsz);
		}

		for(i = 0; i < 16; i++) {
			ipad[i] = bkey[i] ^ 0x36363636;
			opad[i] = bkey[i] ^ 0x5C5C5C5C;
		}

		return core_sha1(opad.concat(core_sha1(ipad.concat(str2binb(data)), 512 + data.length * chrsz)), 512 + 160);
	};

	/**
	 * Convert an array of big-endian words to a base-64 string
	 * @return {string}
	 */
	var binb2b64 = function(binarray) {
		var
			/** @const **/ tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
			str = "",
			i, j;

		for(i = 0; i < binarray.length * 4; i += 3) {
			var
				triplet =
					(((binarray[i >> 2] >> 8 * (3 - i % 4)) & 0xFF) << 16)
					| (((binarray[i + 1 >> 2] >> 8 * (3 - (i + 1) % 4)) & 0xFF) << 8 )
					| ((binarray[i + 2 >> 2] >> 8 * (3 - (i + 2) % 4)) & 0xFF);

			for (j = 0; j < 4; j++) {
				if (i * 8 + j * 6 > binarray.length * 32) {
					str += '=';
				} else {
					str += tab.charAt((triplet >> 6 * (3 - j)) & 0x3F);
				}
			}
		}

		return str;
	};

	return {
		/**
		 * Encode
		 * @param {string} key Key
		 * @param {string} data Data
		 * @return {string}
		 */
		encode: function(key, data) {
			return binb2b64(core_hmac_sha1(key, data));
		}
	}

}() );
