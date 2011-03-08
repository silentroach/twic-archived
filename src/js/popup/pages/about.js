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

		document.getElementById('athanks').innerHTML = chrome.i18n.getMessage('about_thanks');

		document.getElementById('acollaborate').innerHTML = chrome.i18n.getMessage(
			'about_collaborate', [
				'<a href="https://github.com/silentroach/twic/issues" target="_blank">', '</a>',
				'<a href="https://github.com/silentroach/twic" target="_blank">', '</a>'
			]
		);

		document.getElementById('atranslate').innerHTML = chrome.i18n.getMessage(
			'about_translate', [
				'<a href="https://github.com/silentroach/twic-i18n" target="_blank">', '</a>'
			]
		);
	};

	twic.router.handle('about', function(data) {
		this.initOnce(initPage);
	} );

}() );
