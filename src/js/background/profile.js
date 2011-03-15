/**
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

/**
 * Profile page implementation
 */
( function() {

	twic.requests.subscribe('getProfileInfo', function(data, sendResponse) {

		twic.twitter.getUserInfo(data['name'], function(user) {
			sendResponse( user.fields );
		} );

	} );

}() );
