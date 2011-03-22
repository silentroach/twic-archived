/**
 * About page implementation
 *
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

( function() {

	var initPage = function() {
		var
			req = new XMLHttpRequest(),
			manifest;

		req.open('GET', chrome.extension.getURL('manifest.json'), false);
		req.send(null);
		manifest = JSON.parse(req.responseText);

		// todo need to write something for translator
		document.getElementById('aname').innerHTML = twic.name + ' ' + manifest['version'];
		document.getElementById('awhat').innerHTML = chrome.i18n.getMessage('about_what');
		document.getElementById('donate').value    = chrome.i18n.getMessage('button_donate');

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

