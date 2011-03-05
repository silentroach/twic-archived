/**
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

( function() {

	var
		/** @type {HTMLElement} */ about = document.querySelector('#about'),
		/** @type {HTMLElement} */ awhat = document.querySelector('#awhat');
		
	twic.router.handle('about', function(data) {
		awhat.innerHTML = chrome.i18n.getMessage('about_what');
	} );

}() );
