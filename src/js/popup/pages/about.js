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

		twic.dom.findElement('#aname').innerHTML = twic.name + ' ' + manifest['version'];
		twic.dom.findElement('#awhat').innerHTML = twic.utils.lang.translate('about_what');

		twic.dom.findElement('#about .toolbar p').innerHTML = twic.utils.lang.translate('toolbar_about');
		twic.dom.findElement('#about .toolbar a').innerHTML = twic.utils.lang.translate('toolbar_accounts');

		twic.dom.findElement('#athanks').innerHTML = twic.utils.lang.translate('about_thanks');
		twic.dom.findElement('#alinks').innerHTML = twic.utils.lang.translate('about_links');
		twic.dom.findElement('#acontributors').innerHTML = twic.utils.lang.translate('about_contributors');

		twic.dom.findElement('#acollaborate').innerHTML = twic.utils.lang.translate(
			'about_collaborate', [
				'<a href="https://github.com/silentroach/twic/issues" title="github" target="_blank">', '</a>',
				'<a href="http://groups.google.com/group/twicrome" title="google groups" target="_blank">', '</a>',
				'<a href="https://github.com/silentroach/twic" title="github" target="_blank">', '</a>'
			]
		);

		twic.dom.findElement('#atranslate').innerHTML = twic.utils.lang.translate(
			'about_translate', [
				'<a href="https://github.com/silentroach/twic-i18n" title="github" target="_blank">', '</a>'
			]
		);
	};

	twic.router.handle('about', function(data) {
		this.initOnce(initPage);
	} );

}() );
