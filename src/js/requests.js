/**
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

twic.requests = ( function() {

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
	 * @param {function(Object, function(Object))} callback Callback function
	 */
	var subscribe = function(event, callback) {
		if (!(event in subscriptions)) {
			subscriptions[event] = [];
		}

		subscriptions[event].push(callback);
	};

	chrome.extension.onRequest.addListener( function(request, sender, sendResponse) {
		if (
			'method' in request
			&& request['method'] in subscriptions
		) {
			var
				data = request['data'] || {},
				s = subscriptions[request['method']];

			for (var i = 0; i < s.length; ++i) {
				s[i](data, sendResponse);
			}
		} else {
			sendResponse({});
		}
	} );

	return {
		send: send,
		subscribe: subscribe
	};

} )();
