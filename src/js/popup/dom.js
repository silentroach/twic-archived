/**
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

// partially gotten from jQuery
twic.dom = (function() {

	var idExpr = /^#([^ .>:]+)$/;

	/**
	 * @param {string} selector Selector or element
	 * @param {?HTMLElement} context Search context
	 * @return {Object}
	 */
	var dom = function(selector, context) {
		return new dom.fn.init(selector, context);
	};

	dom.fn = dom.prototype = {
		/**
		 * @param {string|HTMLElement} selector Selector or element
		 * @param {?HTMLElement} context Search context
		 * @return {Object}
		 */
		init: function(selector, context) {
			var
				doc = context || document,
				i = 0,
				j = 0,
				l;

			if (selector.nodeType) {
				this[0] = selector;
				this.length = 1;
				return this;
			}

			var
				matches = idExpr.exec(selector),
				elements = (!matches) ? (doc.querySelectorAll(selector) || []) : [];

			if (matches) {
				var tmp = doc.getElementById(matches[1]);

				if (tmp) {
					elements.push(tmp);
				}
			}

			for (l = elements.length; j < l; j++) {
				this[i++] = elements[j];
			}

			this.length = i;

			return this;
		},

		length: 0,

		/**
		 * Collection size
		 * @return {number}
		 */
		size: function() {
			return this.length;
		},

		/**
		 * Each element callback
		 * @param {function()} callback
		 */
		each: function(callback) {
			var i;

			for (i = 0; i < this.length; i++) {
				if (callback.apply(this[i]) === false) {
					break;
				}
			}

			return this;
		},

		/**
		 * Tag contents
		 * @return {?string}
		 */
		html: function() {
			return this[0] && this[0].nodeType === 1 ? this[0].innerHTML : null;
		},

		/**
		 * Tag textual contents
		 * @return {?string}
		 */
		text: function() {
			return this[0] && this[0].nodeType === 1 ? this[0].innerText : null;
		},

		/**
		 * Getting the attribute value
		 * @param {string} key Attribute name
		 */
		attr: function(key) {
			return this[0] && (this[0][key]) ? this[0][key] : null;
		},

		/**
		 * Removing
		 */
		remove: function() {
			this.each( function() {
				this.parentNode.removeChild(this);
			} );

			return this;
		},

		/**
		 * First element
		 */
		first: function() {
			return this[0] ? this[0] : null;
		},

		/**
		 * Is element exists in collection
		 * @param {string} className
		 * @return {boolean}
		 */
		hasClass: function(className) {
			var result = false;

			this.each( function() {
				var
					element = this,
					elementClass = ' ' + element.className + ' ';

				if (elementClass.indexOf(' ' + className + ' ') >= 0) {
					result = true;
					return false;
				}
			} );

			return result;
		},

		/**
		 * Adding class to collection elements
		 * @param {string|Array.<string>} className
		 */
		addClass: function(className) {
			if (typeof className === 'string') {
				className = [className];
			}

			this.each( function() {
				var
					element = this,
					clsName = element.className,
					classes = clsName.split(' ');

				className.forEach( function(cls) {
					if (classes.indexOf(cls) < 0) {
						clsName += ' ' + cls;
					}
				} );

				if (clsName !== element.className) {
					element.className = clsName;
				}
			} );

			return this;
		},

		/**
		 * Removing class
		 * @param {string} className
		 */
		removeClass: function(className) {
			this.each( function() {
				var
					element = this,
					elementClass = (' ' + element.className + ' ');

				element.className = elementClass.replace(' ' + className + ' ', ' ')['trim'](); // closure compiler не ололо про trim
			} );

			return this;
		},

		/**
		 * Toggle class
		 * @param {string} className
		 */
		toggleClass: function(className) {
			if (this.hasClass(className)) {
				this.removeClass(className);
			} else {
				this.addClass(className);
			}

			return this;
		},

		/**
		 * CSS
		 * @param {string} key
		 * @param {string} value
		 */
		css: function(key, value) {
			this.each( function() {
				var element = this;

				element.style[key] = value;
			} );

			return this;
		},

		/**
		 * Showing the element
		 */
		show: function() {
			this.css('display', 'block');
		},

		/**
		 * Hiding element
		 */
		hide: function() {
			this.css('display', 'none');
		}

	};

	dom.fn.init.prototype = dom.fn;

	return (dom);

}() );
