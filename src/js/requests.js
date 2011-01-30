twic.requests = ( function(t) {

	var
		subscriptions = { };

	/**
	 * Send data to background
	 * @param {string} method Method name
	 * @param {Object} data Data to send
	 * @param {function(Object)} callback Callback function
	 */
	var send = function(method, data, callback) {
		chrome.extension.sendRequest( {
			'method': method,
			'data': data
		}, function(reply) {
			if (callback) {
				callback(reply);
			}
		} );
	};

	/**
	 * Subscribe to the event
	 * @param {string} event Event
	 * @param {function(Object}} callback Callback function
	 */
	var subscribe = function(event, callback) {
		subscriptions[event].push(callback);
	};

	return {
		send: send,
		subscribe: subscribe
	};

} )(twic);
