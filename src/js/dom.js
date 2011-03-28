/**
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

/**
 * Some DOM utils
 */

twic.dom = {
	/** @const **/ idExpr: /^#([^ .>:]+)$/,
	/** @const **/ expExpr: /((^|#|\.)\w+)/g
};

/**
 * Find element
 * @param {string} selector Selector
 * @param {Element=} context Context
 * @return {?Element}
 */
twic.dom.find = function(selector, context) {
	var
		matches               = twic.dom.idExpr.exec(selector),
		doc                   = (matches || !context) ? document : context;

	return matches ? doc.getElementById(matches[1]) : doc.querySelector(selector);
};

/**
 * Expand the expression
 * @param {string} expr Expression
 * @return {Element}
 */
twic.dom.expand = function(expr) {
	var
		element = null,
		res;

	// fixme it smells
	
	res = twic.dom.expExpr.exec(expr);

	while (res && res[2]) {
		if (res[2] === '') {
			element = document.createElement(res[1]);
		} else
		if (res[2] === '.') {
			element.classList.add(res[1].substring(1));
		} else
		if (res[2] === '#') {
			element.setAttribute('id', res[1].substring(1));
		}
		
		res = twic.dom.expExpr.exec(expr);
	}

	return element;
};