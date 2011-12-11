/**
 * About page implementation
 *
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

/**
 * @constructor
 * @extends twic.Page
 */
twic.pages.AboutPage = function() {
	twic.Page.call(this);
};

goog.inherits(twic.pages.AboutPage, twic.Page);

twic.pages.AboutPage.prototype.initOnce = function() {
	var
		appDetails = chrome['app']['getDetails']();

	twic.dom.findElement('#aname').innerHTML = twic.name + ' ' + appDetails['version'];

	twic.dom.findElement('#acollaborate').innerHTML = twic.utils.lang.translate(
		'about_collaborate', [
			'<a href="http://twicext.com" title="twicext.com" target="_blank">', '</a>'
		]
	);

	twic.dom.findElement('#atranslate').innerHTML = twic.utils.lang.translate(
		'about_translate', [
			'<a href="https://github.com/silentroach/twic-i18n" title="github" target="_blank">', '</a>'
		]
	);
};
