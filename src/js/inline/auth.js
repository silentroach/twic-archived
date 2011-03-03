/**
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

( function() {

	var
		pinElement  = document.getElementById('oauth_pin'),
		idElement   = document.querySelector('meta[name=session-userid]');

	if (!pinElement) {
		return;
	}

	var
		pin = parseInt(pinElement.innerText, 10),
		userId = parseInt(idElement['content'], 10);

	if (
		!pin
		|| !userId
	) {
		// parse int from the page failed
		return;
	}

	/**
	 * Change the pinned text
	 * @param {string} i18nKey Key for localization
	 */
	var changePinText = function(i18nKey) {
		pinElement.innerText = chrome.i18n.getMessage(i18nKey);
	};

	pinElement.classList.add('mini');

	changePinText('auth_in_progress');

	twic.requests.send('accountAuth', {
		'pin':  pin,
		'user_id': userId
	}, function(reply) {
		if (
			!reply['res']
			// todo make reply identifiers const
			|| 0 === reply['res']
		) {
			changePinText('auth_failed');
			return;
		}

		var res = reply['res'];

		if (1 === res) {
			// success
			changePinText('auth_success');
		} else
		if (2 === res) {
			// already authenticated
			changePinText('auth_already');
		}
	} );

}() );
