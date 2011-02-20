/**
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

twic.notifier = ( function() {

	var
	  /**
	   * Subscriptions
	   * @type {Object}
	   */
		subscriptions = {};

  /**
   * Subscribe the request
   * @param {string} method Method
   * @param {function(Object, function())} callback Callback function
   */
	var subscribe = function(method, callback) {
		subscriptions[method] = callback;
	};
	
	chrome.extension.onRequest.addListener( function(request, sender, sendResponse) {
		if (
			'method' in request
			&& request['method'] in subscriptions
		) {
			subscriptions[request['method']](request, sendResponse);
		} else {
			sendResponse({});
		}
	} );

	return {
		subscribe: subscribe
	};

} )();
