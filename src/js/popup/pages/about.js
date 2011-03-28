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

		twic.dom.find('#aname').innerHTML = twic.name + ' ' + manifest['version'];
		twic.dom.find('#awhat').innerHTML = twic.utils.lang.translate('about_what');
		twic.dom.find('#donate').value    = twic.utils.lang.translate('button_donate');

		twic.dom.find('#about .toolbar p').innerHTML = twic.utils.lang.translate('toolbar_about');
		twic.dom.find('#about .toolbar a').innerHTML = twic.utils.lang.translate('toolbar_accounts');

		twic.dom.find('#athanks').innerHTML = twic.utils.lang.translate('about_thanks');

		twic.dom.find('#acollaborate').innerHTML = twic.utils.lang.translate(
			'about_collaborate', [
				'<a href="https://github.com/silentroach/twic/issues" title="github" target="_blank">', '</a>',
				'<a href="http://groups.google.com/group/twicrome" title="google groups" target="_blank">', '</a>',
				'<a href="https://github.com/silentroach/twic" title="github" target="_blank">', '</a>'
			]
		);

		twic.dom.find('#atranslate').innerHTML = twic.utils.lang.translate(
			'about_translate', [
				'<a href="https://github.com/silentroach/twic-i18n" title="github" target="_blank">', '</a>'
			]
		);
	};

	twic.router.handle('about', function(data) {
		this.initOnce(initPage);
	} );

}() );
