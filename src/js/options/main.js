/**
 * Options
 *
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

( function() {

	var
		i,
		values = [],
		keys = twic.dom.findElements('ul.options[data-key]'),
		tabs = twic.dom.findElements('#tabs li');

	var valVis = function(val) {
		var n;

		for (n = 0; n < values.length; ++n) {
			if (val === values[n].getAttribute('data-value')) {
				values[n].classList.add('selected');
				break;
			}
		}
	};

	for (i = 0; i < keys.length; ++i) {
		var
			optKey = keys[i];

		values = twic.dom.findElements('li[data-value]', optKey);

		twic.options.get(keys[i].getAttribute('data-key'), valVis);
	}

	keys = twic.dom.findElements('input[data-key]');

	twic.utils.queueIterator(keys, function(item, callback) {
		twic.options.get(item.getAttribute('data-key'), function(val) {
			if (val) {
				item.setAttribute('checked', 'checked');
			}

			callback();
		} );
	}, function() { } );

	/**
	 * Handling option value change
	 */
	document.addEventListener('change', function(e) {
		if ('INPUT' === e.target.nodeName) {
			twic.options.set(e.target.getAttribute('data-key'), e.target['checked']);
		}
	}, false );

	/**
	 * Handling option value select click
	 * @param {Element} element Option element
	 */
	var onOptionClick = function(element) {
		var
			optKeyElement = element.parentElement,
			optValue = element.getAttribute('data-value'),
			optValues = twic.dom.findElements('li[data-value]', optKeyElement),
			optKey = optKeyElement.getAttribute('data-key'),
			n;

		twic.options.set(optKey, optValue);

		for (n = 0; n < optValues.length; ++n) {
			if (optValues[n] !== optValue) {
				optValues[n].classList.remove('selected');
			}
		}

		element.classList.add('selected');
	};

	/**
	 * Handling tab click
	 * @param {Element} element Tab element
	 */
	var onTabClick = function(element) {
		var
			/** @type {Element} **/ tab = null,
			/** @type {Element} **/ content = null,
			/** @type {string}  **/ targetTabName = element.getAttribute('data-content'),
			/** @type {string}  **/ tabName = '',
			/** @type {number}  **/ i = 0;

		if (twic.dom.hasClass(element, 'active')) {
			return;
		}

		for (i = 0; i < tabs.length; ++i) {
			tab = tabs[i];
			tabName = tab.getAttribute('data-content');
			content = twic.dom.findElement('#' + tabName);

			if (!content) {
				continue;
			}

			if (targetTabName == tabName) {
				twic.dom.addClass(tab, 'active');
				twic.dom.setVisibility(content, true);
			} else
			if (twic.dom.hasClass(tab, 'active')) {
				twic.dom.removeClass(tab, 'active');
				twic.dom.setVisibility(content, false);
			}
		}
	};

	document.addEventListener('click', function(e) {
		var
			optElement = twic.dom.findClosestParentByAttr(e.target, 'data-value');

		if (optElement) {
			onOptionClick(optElement);
		} else {
			var
				tabElement = twic.dom.findClosestParentByAttr(e.target, 'data-content');

			if (tabElement) {
				onTabClick(tabElement);
			}
		}
	}, false);

}() );
