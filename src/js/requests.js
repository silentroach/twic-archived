/**
 * Handle crosspage extension messaging
 *
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

twic.requests = ( function() {

	var
		requests = { },
		subscriptions = { };

	/**
	 * Send data to background
	 * @param {string} method Method name
	 * @param {Object} data Data to send
	 * @param {function(Object)} callback Callback function
	 */
	requests.send = function(method, data, callback) {
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
	requests.subscribe = function(event, callback) {
		if (!subscriptions[event]) {
			subscriptions[event] = [];
		}

		twic.debug.info('subscribe for ' + event);

		subscriptions[event].push(callback);
	};

	// todo make sendResponse our own method to send it if it was not sent in callback?
	chrome.extension.onRequest.addListener( function(request, sender, sendResponse) {
		var
			method = request['method'],
			subscription = subscriptions[method],
			data = request['data'] || {},
			i;

		if (
			method
			&& subscription
		) {
			twic.debug.groupCollapsed('request ' + method + ' received');
			twic.debug.dir(data);
			twic.debug.groupEnd();

			for (i = 0; i < subscription.length; ++i) {
				subscription[i](data, sendResponse);
			}
		} else {
			sendResponse({});

			twic.debug.groupCollapsed('request received');
			twic.debug.error('failed or handler not found');
			twic.debug.dir(request);
			twic.debug.groupEnd();
		}
	} );

	return requests;

}() );
