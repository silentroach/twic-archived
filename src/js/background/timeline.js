/**
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

( function() {

	twic.requests.subscribe('getTimeline', function(data, sendResponse) {
		if (!('id' in data)) {
			sendResponse({});
			return false;
		}
		
		var 
			id = data['id'];

		twic.twitter.homeTimeline(id, function(data) {
			
		} );

		sendResponse({});
	} );

} )();
