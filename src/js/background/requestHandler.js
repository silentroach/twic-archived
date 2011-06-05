/**
 * Handler for the crosspage extension messaging
 *
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

( function() {

	// todo make sendResponse our own method to send it if it was not sent in callback?
	chrome.extension.onRequest.addListener( function(request, sender, sendResponse) {
		twic.requests.handle(request, sender, sendResponse);
	} );
	
}() );
