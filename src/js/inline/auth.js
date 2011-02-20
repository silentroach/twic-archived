/**
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */
( function(t) {

	var 
		pinElement  = document.getElementById('oauth_pin');

	if (!pinElement) {
		return;
	}

	var
		idElement   = document.querySelector('meta[name=session-userid]'),
		nameElement = document.querySelector('meta[name=session-user-screen_name]');

	if (
		!idElement
		|| !nameElement
	) {
		return;
	}
	
	var 
		pin = parseInt(pinElement.innerText),
		id  = parseInt(idElement['content']),
		nick = nameElement['content'];
		
	twic.requests.send('accountAuthenticated', {
		'id': id,
		'nick': nick,
		'pin': pin
	}, function(reply) {
		pinElement.innerText = chrome.i18n.getMessage('thank_you');
	} );

} )(twic);
