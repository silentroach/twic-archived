/**
 * Some DOM utils
 *
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

twic.dom = ( function() {
	var
		dom = { },
		/** @const **/ idExpr  = /^#([^ .>:]+)$/,
		/** @const **/ expExpr = /((^|#|\.)\w+)/g;

	/**
	 * Remove the item from dom
	 * @param {Element} element Element ;)
	 */
	dom.removeElement = function(element) {
		element.parentNode.removeChild(element);
	};

	/**
	 * Find element
	 * @param {string} selector Selector
	 * @param {Element=} context Context
	 * @return {?Element}
	 */
	dom.findElement = function(selector, context) {
		var
			matches = idExpr.exec(selector),
			doc     = (matches || !context) ? document : context;

		return matches ? doc.getElementById(matches[1]) : doc.querySelector(selector);
	};

	/**
	 * Expand the expression
	 * @param {string} expr Expression
	 * @return {Element}
	 */
	dom.expandElement = function(expr) {
		var
			element = null,
			res,
			/** @type {string} **/ part;

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
	dom.isChildOf = function(element, parent) {
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
	dom.setVisibility = function(element, visible) {
		element.style.display = visible ? '' : 'none';
		return visible;
	};

	return dom;

}() );
