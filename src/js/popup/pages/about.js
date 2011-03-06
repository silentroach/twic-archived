/**
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

( function() {

	var
		/** @type {HTMLElement} */ awhat = document.getElementById('awhat'),
		/** @type {HTMLElement} */ donateButton = document.getElementById('donate');

	donateButton.value = chrome.i18n.getMessage('button_donate');
	awhat.innerHTML    = chrome.i18n.getMessage('about_what');

	document.querySelector('#about .toolbar p').innerHTML = chrome.i18n.getMessage('toolbar_about');
	document.querySelector('#about .toolbar a').innerHTML = chrome.i18n.getMessage('toolbar_accounts');

	twic.router.handle('about', function(data) {

	} );

}() );
