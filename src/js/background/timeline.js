/**
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

( function() {

	// todo request[data] -> request
	twic.notifier.subscribe('getTimeline', function(request, sendResponse) {
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

} )();
