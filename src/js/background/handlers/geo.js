/**
 * Geolocation support
 *
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

( function() {

	var
		lastPos = {
			coords: {
				lat: 0,
				lng: 0
			},
			ts: 0
		};

	twic.requests.subscribe('getCoords', function(data, sendResponse) {
		var
			ts = twic.utils.date.getCurrentTimestamp();

		var replyPos = function() {
			sendResponse( [ lastPos.coords.lat, lastPos.coords.lng ]);
		};

		// caching last coords for the 5 minutes
		if (ts - lastPos.ts < 5 * 60) {
			replyPos();
			return;
		}

		navigator.geolocation.getCurrentPosition( function(position) {
			lastPos.ts = ts;
			lastPos.coords.lat = position.coords.latitude;
			lastPos.coords.lng = position.coords.longitude;

			replyPos();
		}, function(error) {
			lastPos.result = false;
			sendResponse( false );
		} );
	} );

}() );
