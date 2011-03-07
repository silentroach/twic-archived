/**
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

( function() {

	var initPage = function() {
		document.getElementById('donate').value    = chrome.i18n.getMessage('button_donate');
		document.getElementById('awhat').innerHTML = chrome.i18n.getMessage('about_what');

		document.querySelector('#about .toolbar p').innerHTML = chrome.i18n.getMessage('toolbar_about');
		document.querySelector('#about .toolbar a').innerHTML = chrome.i18n.getMessage('toolbar_accounts');
	};

	twic.router.handle('about', function(data) {
		this.init(initPage);
	} );

}() );
