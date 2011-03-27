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

		document.getElementById('aname').innerHTML = twic.name + ' ' + manifest['version'];
		document.getElementById('awhat').innerHTML = twic.utils.lang.translate('about_what');
		document.getElementById('donate').value    = twic.utils.lang.translate('button_donate');

		document.querySelector('#about .toolbar p').innerHTML = twic.utils.lang.translate('toolbar_about');
		document.querySelector('#about .toolbar a').innerHTML = twic.utils.lang.translate('toolbar_accounts');

		document.getElementById('athanks').innerHTML = twic.utils.lang.translate('about_thanks');

		document.getElementById('acollaborate').innerHTML = twic.utils.lang.translate(
			'about_collaborate', [
				'<a href="https://github.com/silentroach/twic/issues" title="github" target="_blank">', '</a>',
				'<a href="http://groups.google.com/group/twicrome" title="google groups" target="_blank">', '</a>',
				'<a href="https://github.com/silentroach/twic" title="github" target="_blank">', '</a>'
			]
		);

		document.getElementById('atranslate').innerHTML = twic.utils.lang.translate(
			'about_translate', [
				'<a href="https://github.com/silentroach/twic-i18n" title="github" target="_blank">', '</a>'
			]
		);
	};

	twic.router.handle('about', function(data) {
		this.initOnce(initPage);
	} );

}() );
