/**
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */
( function() {

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

  /**
   * Change the pinned text
   * @param {string} i18nKey Key for localization
   */
  var changePinText = function(i18nKey) {
    pinElement.innerText = chrome.i18n.getMessage(i18nKey);
  };

  changePinText('auth_in_progress');
		
	twic.requests.send('accountAuth', {
		'id':   id,
		'nick': nick,
		'pin':  pin
	}, function(reply) {
	  changePinText('auth_thanks');
	} );

} )();
