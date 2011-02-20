/**
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

/**
 * @constructor
 */
twic.request = function(method, url) {
	this.method = method;
	this.url = url;
	this.headers = {};
	this.data = {};
};

/**
 * Encode the string
 * FIXME already in oauth
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

twic.request.prototype = {
	
	setHeader: function(key, value) {
		this.headers[key] = value;
	},
	
	setData: function(key, value) {
		this.data[key] = value;
	},
	
	send: function(callback) {
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
			data.push(encode(key) + '=' + encode(this.data[key]));
		}
		
		req.send(data.join('&'));
	}
	
};
