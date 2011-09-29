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
		keys = twic.dom.findElements('ul.options[data-key]');

	var valVis = function(val) {
		var n;

		for (n = 0; n < values.length; ++n) {
			if (val === values[n].getAttribute('data-value')) {
				values[n].classList.add('selected');
				break;
			}
		}
	};

	var onElementChange = function(element) {
		if ('INPUT' === element.nodeName) {
			twic.options.set(element.getAttribute('data-key'), element['checked']);

			checkInnerChecks(element);
		}
	};

	var checkInnerChecks = function(element) {
		var
			checked = element['checked'],
			children = twic.dom.findElements('ul li', element.parentNode),
			inputs = null,
			i, n;

		if (children.length > 0) {
			for (n = 0; n < children.length; ++n) {
				if (checked) {
					twic.dom.removeClass(children[n], 'disabled');
				} else {
					twic.dom.addClass(children[n], 'disabled');
				}

				inputs = twic.dom.findElements('input', children[n]);

				for (i = 0; i < inputs.length; ++i) {
					if (checked) {
						inputs[i].removeAttribute('disabled');
					} else {
						inputs[i].setAttribute('disabled', 'disabled');
						inputs[i]['checked'] = false;

						onElementChange(inputs[i]);
					}
				}
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

	async.forEach(keys, function(item, callback) {
		twic.options.get(item.getAttribute('data-key'), function(val) {
			if (val) {
				item.setAttribute('checked', 'checked');
			}

			checkInnerChecks(item);
			callback();
		} );
	}, function() { } );

	var findParentOption = function(trgElement) {
		if (trgElement.getAttribute('data-value')) {
			return trgElement;
		}

		if (trgElement.parentElement) {
			return findParentOption(trgElement.parentElement);
		}
	};

	document.addEventListener('change', function(e) {
		onElementChange(e.target);
	}, false );

	document.addEventListener('click', function(e) {
		var
			optElement = findParentOption(e.target);

		if (!optElement) {
			return;
		}

		var
			optKeyElement = optElement.parentElement,
			optValue = optElement.getAttribute('data-value'),
			optValues = twic.dom.findElements('li[data-value]', optKeyElement),
			optKey = optKeyElement.getAttribute('data-key'),
			n;

		twic.options.set(optKey, optValue);

		for (n = 0; n < optValues.length; ++n) {
			if (optValues[n] !== optValue) {
				optValues[n].classList.remove('selected');
			}
		}

		optElement.classList.add('selected');
	}, false);

}() );
