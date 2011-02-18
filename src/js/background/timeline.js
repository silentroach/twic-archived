( function(t) {

	// todo request[data] -> request
	t.notifier.subscribe('getTimeline', function(request, sendResponse) {
		if (!('id' in request['data'])) {
			sendResponse({});
			return false;
		}
		
		var id = request['data']['id'];

		if (t.accounts.isItMe(id)) {
			t.api.homeTimeline(id, function(data) {
			
			} );
		} else {
		
		}

		sendResponse({});
	} );

} )(twic);