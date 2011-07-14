/**
 * CSS injector
 *
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

twic.style = { };

/**
 * @type {Element}
 * @private
 */
twic.style.headElement_;

/**
 * @type {Object.<string,number>}
 * @private
 */
twic.style.injected_ = { };

/**
 * @param {string} file Filename
 */
twic.style.inject = function(file) {
	if (file in twic.style.injected_) {
		return false;
	} else {
		twic.style.injected_[file] = 1;
	}

	if (!twic.style.headElement_) {
		twic.style.headElement_ = twic.dom.findElement('head');
	}

	var styleElement = twic.dom.expandElement('link');
	styleElement.setAttribute('rel', 'stylesheet');
	styleElement.setAttribute('type', 'text/css');
	styleElement.setAttribute('href', file);

	twic.style.headElement_.appendChild(styleElement);
};
