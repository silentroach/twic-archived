/**
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */
( function() {

	twic.requests.subscribe('getProfileInfo', function(data, sendResponse) {

		twic.twitter.getUserInfo(data['name'], function(user) {
			sendResponse( user.fields );
		} );

	} );

}() );
