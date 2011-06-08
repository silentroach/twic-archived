/**
 * CSS injector
 *
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

twic.style = ( function() {

	var
		headElement,
		self = { },
		injected = { };

	self.inject = function(file) {
		if (file in injected) {
			return false;
		} else {
			injected[file] = 1;
		}

		if (!headElement) {
			headElement = twic.dom.findElement('head');
		}

		var styleElement = twic.dom.expandElement('link');
		styleElement.setAttribute('rel', 'stylesheet');
		styleElement.setAttribute('type', 'text/css');
		styleElement.setAttribute('href', file);

		headElement.appendChild(styleElement);
	};

	return self;

}() );
