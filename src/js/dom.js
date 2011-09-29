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
 * Find elements
 * @param {string} selector Selector
 * @param {Element=} context Context
 * @return {?NodeList}
 */
twic.dom.findElements = function(selector, context) {
	var
		doc = !context ? document : context;

	return doc.querySelectorAll(selector);
};

/**
 * Insert element into container on the first place
 * @param {Element} container Container
 * @param {Element} element Element
 */
twic.dom.insertFirst = function(container, element) {
	if (container.firstChild) {
		container.insertBefore(element, container.firstChild);
	} else {
		container.appendChild(element);
	}
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
		while (element.parentElement) {
			element = element.parentElement;

			if (element === parent) {
				return true;
			}
		}
	}

	return false;
};

/**
 * Find closest parent by attribute
 * @param {Element} element Element
 * @param {string} attrName Attribute name
 */
twic.dom.findClosestParentByAttr = function(element, attrName) {
	if (element.getAttribute(attrName)) {
		return element;
	}

	if (element.parentElement) {
		return twic.dom.findClosestParentByAttr(element.parentElement, attrName);
	}
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

/**
 * Has class?
 * @param {Element} element Element
 * @param {string} className Class name
 */
twic.dom.hasClass = function(element, className) {
	return element.classList.contains(className);
};

/**
 * Add class to element
 * @param {Element} element Element
 * @param {string} className Class name
 */
twic.dom.addClass = function(element, className) {
	element.classList.add(className);
};

/**
 * Remove class from element
 * @param {Element} element Element
 * @param {string} className Class name
 */
twic.dom.removeClass = function(element, className) {
	element.classList.remove(className);
};

/**
 * Is element has class?
 * @param {Element} element Element
 * @param {string} className Class name
 * @return {Boolean}
 */
twic.dom.hasClass = function(element, className) {
	return element.classList.contains(className);
}
