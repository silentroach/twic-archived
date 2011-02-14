twic.notifier = ( function(t) {

	var
		subscriptions = {};

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

} )(twic);
