/**
 * Injector
 *
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

twic.inject = { };

/**
 * @type {Element}
 * @private
 */
twic.inject.headElement_;

/**
 * @type {Object.<string,number>}
 * @private
 */
twic.inject.injected_ = { };

/**
 * @param {string} file Filename
 */
twic.inject.css = function(file) {
	if (file in twic.inject.injected_) {
		return false;
	} else {
		twic.inject.injected_[file] = 1;
	}

	if (!twic.inject.headElement_) {
		twic.inject.headElement_ = twic.dom.findElement('head');
	}

	var styleElement = twic.dom.expandElement('link');
	styleElement.setAttribute('rel', 'stylesheet');
	styleElement.setAttribute('type', 'text/css');
	styleElement.setAttribute('href', file);

	twic.inject.headElement_.appendChild(styleElement);
};

/**
 * @param {string} file Filename
 */
twic.inject.js = function(file) {
	if (file in twic.inject.injected_) {
		return false;
	} else {
		twic.inject.injected_[file] = 1;
	}

	var scriptElement = twic.dom.expandElement('script');
	scriptElement.src = file;
	document.body.appendChild(scriptElement);
};
