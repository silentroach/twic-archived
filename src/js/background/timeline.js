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
			id = data['id'],
			account = twic.accounts.getInfo(id);

		if (account) {
			twic.api.homeTimeline(id, account['oauth_token'], account['oauth_token_secret'], function(data) {
			
			} );
		} else {
		
		}

		sendResponse({});
	} );

} )();
