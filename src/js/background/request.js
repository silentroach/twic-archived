/**
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

/**
 * @constructor
 */
twic.Request = function(method, url) {
	this.method = method;
	this.url = url;
	this.headers = {};
	this.data = {};
};

/**
 * @param {string} data Data
 * @return {Object} Parsed object
 * FIXME FIXTHISSHIT!
 */
twic.Request.convertDataToParams = function(data) {
	var
		result = {},
		parts  = data.split('&'),
		i;

	for (i = 0; i < parts.length; ++i) {
		var
			tmp = parts[i].split('=');

		if (2 === tmp.length) {
			result[tmp[0]] = tmp[1];
		}
	}

	return result;
};

/**
 * Static function to encode the string
 * @param {string} str String
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
 * @param {string} key Key
 * @param {string} value Value
 */
twic.Request.prototype.setHeader = function(key, value) {
  this.headers[key] = value;
};

/**
 * Set request POST data
 * @param {string} key Key
 * @param {string} value Value
 */
twic.Request.prototype.setData = function(key, value) {
	this.data[key] = value;
};

/**
 * Send the request
 * @param {function(XMLHttpRequest)} callback Callback
 */
twic.Request.prototype.send = function(callback) {
	var
		data = [],
		key;

	for (key in this.data) {
		data.push(key + '=' + this.encodeString(this.data[key]));
	}

	var req = new XMLHttpRequest();
	req.open(this.method, this.url + (this.method === 'GET' ? '?' + data.join('&') : ''));

	for (key in this.headers) {
		req.setRequestHeader(key, this.headers[key]);
	}

	req.onreadystatechange = function() {
		var req = this;

		if (req.readyState === XMLHttpRequest.DONE) {
			if (req.status === 401) {
				twic.debug.groupCollapsed(req);
				twic.debug.error('Unauthorized');
				twic.debug.groupEnd();

				// Unauthorized
				// fixme handler
				return;
			}

			if (req.responseText === '') {
				twic.debug.groupCollapsed(req);
				twic.debug.error('Empty reply');
				twic.debug.groupEnd();

				// timeout or something is wrong
				return;
			}

			if (req.status === 200) {
				callback(req);
			} else {
				twic.debug.groupCollapsed(req);
				twic.debug.error('Unknown status');
				twic.debug.log(req.status);
				twic.debug.log(req.responseText);
				twic.debug.groupEnd();
			}
		}
	};

	if (this.method === 'GET') {
		req.send();
	} else {
		req.send(data.join('&'));
	}
};
