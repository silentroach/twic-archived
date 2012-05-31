/**
 * HTTP Request
 *
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

/**
 * @constructor
 * @param {string} method Method (GET, POST)
 * @param {string} url Url
 */
twic.HTTPRequest = function(method, url) {
	/**
	 * GET/POST
	 * @protected
	 * @type {string}
	 */
	this.method_ = method;

	/**
	 * URL
	 * @type {string}
	 * @protected
	 */
	this.url_ = url;

	/**
	 * Headers
	 * @type {Object.<string, string>}
	 * @private
	 */
	this.requestHeaders_ = {};

	/**
	 * Data
	 * @type {Object.<string, string>}
	 * @private
	 */
	this.data_ = {};
};

/**
 * @param {string} data Data
 * @return {Object} Parsed object
 */
twic.HTTPRequest.queryStringToObject = function(data) {
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
 * Get all the data
 * @protected
 * @return {Array.<string>}
 */
twic.HTTPRequest.prototype.getData_ = function() {
	var
		self = this,
		key = '',
		data = [];

	for (key in self.data_) {
		data.push(self.encodeString(key) + '=' + self.encodeString(self.data_[key]));
	}

	return data;
};

/**
 * Static function to encode the string
 * @param {string} str String
 * @return {string}
 */
twic.HTTPRequest.prototype.encodeString = function(str) {
	return encodeURIComponent(str)
		.replace(/\!/g, '%21')
		.replace(/\*/g, '%2A')
		.replace(/'/g, '%27')
		.replace(/\(/g, '%28')
		.replace(/\)/g, '%29');
};

/**
 * Set request custom header
 * @param {string} key Key
 * @param {string} value Value
 */
twic.HTTPRequest.prototype.setHeader = function(key, value) {
  this.requestHeaders_[key] = value;
};

/**
 * Set request POST data
 * @param {string} key Key
 * @param {string|number} value Value
 */
twic.HTTPRequest.prototype.setRequestData = function(key, value) {
	this.data_[key] = value.toString();
};

/**
 * Send the request
 * @param {function(?twic.ResponseError, XMLHttpRequest)} callback Callback
 * todo send method can't be shortened by Closure Compiler, don't know why
 */
twic.HTTPRequest.prototype.send = function(callback) {
	var
		self = this,
		data = self.getData_(),
		key = '';

	var req = new XMLHttpRequest();

	req.onreadystatechange = function() {
		var req = this;

		if (4 === req.readyState) {
			var
				error = null;

			if (0 === req.status) {
				twic.debug.error('No connection');
				error = new twic.ResponseError(twic.ResponseError.NO_CONNECTION, req);
			} else
			if (404 === req.status) {
				twic.debug.groupCollapsed(req);
				twic.debug.error('Not found');
				twic.debug.groupEnd();

				error = new twic.ResponseError(twic.ResponseError.NOT_FOUND, req);
			} else
			if (401 === req.status) {
				twic.debug.groupCollapsed(req);
				twic.debug.error('Unauthorized');
				twic.debug.groupEnd();

				error = new twic.ResponseError(twic.ResponseError.UNAUTHORIZED, req);
			} else
			if ('' === req.responseText) {
				twic.debug.groupCollapsed(req);
				twic.debug.error('Empty reply');
				twic.debug.groupEnd();

				error = new twic.ResponseError(twic.ResponseError.TIMEOUT, req);
			} else
			if (200 === req.status) {
				twic.debug.groupCollapsed('http request to ' + self.url_ + ' finished');
				try {
					twic.debug.dir(JSON.parse(req.responseText));
				} catch(e) {
					twic.debug.info(req.responseText);
				}
				twic.debug.groupEnd();
			} else {
				twic.debug.groupCollapsed(req);
				twic.debug.error('Unknown status');
				twic.debug.log(req.status);
				twic.debug.log(req.responseText);
				twic.debug.groupEnd();

				error = new twic.ResponseError(twic.ResponseError.UNKNOWN, req);
			}

			callback(error, req);
		}
	};

	req.open(self.method_, self.url_ + ('GET' === self.method_ && data.length > 0 ? '?' + data.join('&') : ''));

	for (key in self.requestHeaders_) {
		req.setRequestHeader(key, self.requestHeaders_[key]);
	}

	if ('GET' === self.method_) {
		req.send();
	} else {
		req.send(data.join('&'));
	}
};

