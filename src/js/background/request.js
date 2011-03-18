/**
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

/**
 * @constructor
 * @param {number} code Error code
 */
twic.ResponseError = function(code) {
	this.code = code;
};

/** @const */ twic.ResponseError.UNKNOWN      = 0;
/** @const */ twic.ResponseError.UNAUTHORIZED = 1;
/** @const */ twic.ResponseError.TIMEOUT      = 2;

/**
 * @constructor
 * @param {string} method Method (GET, POST)
 * @param {string} url Url
 */
twic.Request = function(method, url) {
	this.method = method;
	this.url = url;
	this.headers = {};
	this.data = {};
};

/**
 * @param {!string} data Data
 * @return {Object} Parsed object
 */
twic.Request.queryStringToObject = function(data) {
	var
		result = { },
		tmp,
		r = /([^&=]+)=?([^&]*)/g;

	while (true) {
		tmp = r.exec(data);

		if (!tmp) {
			break;
		}

		result[tmp[1]] = tmp[2];
	}

	return result;
};

/**
 * Static function to encode the string
 * @param {!string} str String
 * @return {string}
 */
twic.Request.prototype.encodeString = function(str) {
	result = encodeURIComponent(str);

	result = result.replace(/\!/g, '%21');
	result = result.replace(/\*/g, '%2A');
	result = result.replace(/\'/g, '%27');
	result = result.replace(/\(/g, '%28');
	result = result.replace(/\)/g, '%29');

	return result;
};

/**
 * Set request custom header
 * @param {!string} key Key
 * @param {!string} value Value
 */
twic.Request.prototype.setHeader = function(key, value) {
  this.headers[key] = value;
};

/**
 * Set request POST data
 * @param {!string} key Key
 * @param {!string} value Value
 * todo maybe it will be great to get the object with params
 */
twic.Request.prototype.setData = function(key, value) {
	this.data[key] = value;
};

/**
 * Send the request
 * @param {function(?twic.ResponseError, ?XMLHttpRequest)} callback Callback
 * todo failed callback or make the request returnable object
 */
twic.Request.prototype.send = function(callback) {
	var
		self = this,
		data = [],
		key;

	for (key in self.data) {
		data.push(key + '=' + self.encodeString(self.data[key]));
	}

	var req = new XMLHttpRequest();
	req.open(self.method, self.url + (self.method === 'GET' ? '?' + data.join('&') : ''));

	for (key in self.headers) {
		req.setRequestHeader(key, self.headers[key]);
	}

	req.onreadystatechange = function() {
		var req = this;

		if (req.readyState === XMLHttpRequest.DONE) {
			if (req.status === 401) {
				twic.debug.groupCollapsed(req);
				twic.debug.error('Unauthorized');
				twic.debug.groupEnd();

				callback(new twic.ResponseError(twic.ResponseError.UNAUTHORIZED));
			} else
			if (req.responseText === '') {
				twic.debug.groupCollapsed(req);
				twic.debug.error('Empty reply');
				twic.debug.groupEnd();

				callback(new twic.ResponseError(twic.ResponseError.TIMEOUT));
			} else
			if (req.status === 200) {
				twic.debug.groupCollapsed('http request to ' + self.url + ' finished');
				try {
					twic.debug.dir(JSON.parse(req.responseText));
				} catch(e) {
					twic.debug.info(req.responseText);
				}
				twic.debug.groupEnd();

				callback(null, req);
			} else {
				twic.debug.groupCollapsed(req);
				twic.debug.error('Unknown status');
				twic.debug.log(req.status);
				twic.debug.log(req.responseText);
				twic.debug.groupEnd();

				callback(new twic.ResponseError(twic.ResponseError.UNKNOWN));
			}
		}
	};

	if (self.method === 'GET') {
		req.send();
	} else {
		req.send(data.join('&'));
	}
};
