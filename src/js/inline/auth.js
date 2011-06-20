/**
 * Inline script to get user PIN code
 *
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

( function() {

	var
		pinElement  = twic.dom.findElement('kbd'),
		nickElement = twic.dom.findElement('.current-user .name'),
		descElement = twic.dom.findElement('.action-information');

	if (
		!pinElement
		|| !descElement
		|| !descElement.innerText.match(twic.name)
	) {
		return;
	}

	var
		pin = parseInt(pinElement.innerText.trim(), 10),
		userNick = nickElement.innerText.trim();

	if (
		!pin
		|| !userNick
	) {
		// parse int from the page failed
		return;
	}

	/**
	 * Change the pinned text
	 * @param {string} i18nKey Key for localization
	 */
	var changePinText = function(i18nKey) {
		pinElement.innerText = twic.utils.lang.translate(i18nKey);
	};

	twic.debug.info('Pin code: ' + pin);

	pinElement.classList.add('mini');
	changePinText('auth_in_progress');

	twic.requests.makeRequest('accountAuth', {
		'pin':  pin,
		'user_nick': userNick
	}, function(reply) {
		if (
			!reply['res']
			|| twic.global.FAILED === reply['res']
		) {
			changePinText('auth_failed');
			return;
		}

		var res = reply['res'];

		if (twic.global.SUCCESS === res) {
			// success
			changePinText('auth_success');
		} else
		if (twic.global.AUTH_ALREADY === res) {
			// already authenticated
			changePinText('auth_already');
		}
	} );

}() );
