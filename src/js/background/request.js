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
 * Encode the string
 * @param {string} str String
 * @return {string}
 */
twic.Request.prototype.encodeString = function(str) {
	var result = encodeURIComponent(str);
	
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
 * @param {function(string)} callback Callback
 */
twic.Request.prototype.send = function(callback) {
	var req = new XMLHttpRequest();
	req.open(this.method, this.url);
	
	for (var key in this.headers) {
		req.setRequestHeader(key, this.headers[key]);
	}
	
	req.onreadystatechange = function() {
		if (this.readyState == XMLHttpRequest.DONE) {
			callback(this);
		}
	};
	
	var data = [];
	
	for (var key in this.data) {
		data.push(this.encodeString(key) + '=' + this.encodeString(this.data[key]));
	}
	
	req.send(data.join('&'));
};

/**
 * @param {string} data Data
 * @return {Object} Parsed object
 * FIXME FIXTHISSHIT!
 */
convertDataToParams = function(data) {
	var 
		result = {},
		parts  = data.split('&');

	for (var i = 0; i < parts.length; ++i) {
		var 
			tmp = parts[i].split('=');
		
		if (2 == tmp.length) {
			result[tmp[0]] = tmp[1];
		}
	}
	
	return result;
};