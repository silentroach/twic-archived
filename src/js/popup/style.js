/**
 * CSS injector
 *
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

twic.style = ( function() {

	var
		styleElement,
		style = { };

	var getStyleElement = function() {
		if (styleElement) {
			return styleElement;
		}

		var
			headElement = twic.dom.findElement('head');

		styleElement = twic.dom.expandElement('style#injected');

		headElement.appendChild(styleElement);

		return styleElement;
	};

	style.inject = function(text) {
		var
			element = getStyleElement();

		element.innerText += text;
	};

	return style;

}() );
