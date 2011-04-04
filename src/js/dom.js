/**
 * Some DOM utils
 *
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

twic.dom = { };

/**
 * Remove the item from dom
 * @param {Element} element Element ;)
 */
twic.dom.removeElement = function(element) {
	element.parentNode.removeChild(element);
};

/**
 * Find element
 * @param {string} selector Selector
 * @param {Element=} context Context
 * @return {?Element}
 */
twic.dom.findElement = function(selector, context) {
	var
		/** @const **/ idExpr  = /^#([^ .>:]+)$/,
		matches = idExpr.exec(selector),
		doc     = (matches || !context) ? document : context;

	return matches ? doc.getElementById(matches[1]) : doc.querySelector(selector);
};

/**
 * Expand the expression
 * @param {string} expr Expression
 * @return {Element}
 */
twic.dom.expandElement = function(expr) {
	var
		/** @const **/ expExpr = /((^|#|\.)\w+)/g,
		/** @type {string} **/ part,
		element = null,
		res;

	res = expExpr.exec(expr);

	while (
		res
		&& res.length > 2
	) {
		part = res[2];

		if (part === '') {
			element = document.createElement(res[1]);
		} else
		if (part === '.') {
			element.classList.add(res[1].substring(1));
		} else
		if (part === '#') {
			element.setAttribute('id', res[1].substring(1));
		}

		res = expExpr.exec(expr);
	}

	return element;
};

/**
 * Is element child of someone
 * @param {Element} element Element
 * @param {Element} parent Possible element parent
 * @return {boolean}
 */
twic.dom.isChildOf = function(element, parent) {
	if (element) {
		while (element.parentNode) {
			element = element.parentNode;

			if (element === parent) {
				return true;
			}
		}
	}

	return false;
};

/**
 * Change visibility for the element
 * @param {Element} element Element
 * @param {boolean} visible Is it visible?
 * @return {boolean} Is it visible?
 */
twic.dom.setVisibility = function(element, visible) {
	element.style.display = visible ? '' : 'none';
	return visible;
};
