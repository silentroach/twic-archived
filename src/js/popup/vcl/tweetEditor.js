/**
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

twic.vcl = twic.vcl || { };

/**
 * @constructor
 */
twic.vcl.tweetEditor = function(parent) {

	// init

	var
		editor = this,
		/** @type {HTMLDivElement}      **/ editorWrapper  = document.createElement('div'),
		/** @type {twic.dom}            **/ $editorWrapper = twic.dom(editorWrapper),
		/** @type {HTMLTextAreaElement} **/ editorTextarea = document.createElement('textarea'),
		/** @type {HTMLElement}         **/ editorCounter  = document.createElement('span'),

		/** @const **/ overloadClass = 'overload',
		/** @const **/ focusedClass  = 'focused';

	editorWrapper.className = 'tweetEditor';
	editorTextarea.rows = 1;
	editorCounter.innerHTML = '140';

	editorWrapper.appendChild(editorTextarea);
	editorWrapper.appendChild(editorCounter);

	if (parent.childElementCount > 0) {
		parent.insertBefore(editorWrapper, parent.firstChild);
	} else {
		parent.appendChild(editorWrapper);
	}

	var checkTweetArea = function() {
		var tLen = editorTextarea.value.length;

		while (editorTextarea.scrollTop > 0) {
			++editorTextarea.rows;
		}

		editorCounter.innerHTML = (140 - tLen).toString();

		// fixme refactor
		if (tLen > 140) {
			$editorWrapper.addClass(overloadClass);
		} else {
			$editorWrapper.removeClass(overloadClass);
		}
	};

	// check the textarea for chars count
	editorTextarea.onkeyup = function(e) {
		checkTweetArea();
	};

	// prevent user to press enter
	editorTextarea.onkeydown = function(e) {
		if (e.keyCode === 13) {
			e.preventDefault();

			if (e.ctrlKey) {
				/** @type {string} **/ var val = editorTextarea.value;

				if (val.length > 0) {
					editor.onTweetSend(val);
				}
			}
		}
	};

	editorTextarea.onfocus = function() {
		$editorWrapper.addClass(focusedClass);
	};

	editorTextarea.onblur = function() {
		$editorWrapper.removeClass(focusedClass);
	};

	// functions

	editor.setPlaceholder = function(alias) {
		editorTextarea.placeholder = chrome.i18n.getMessage(alias);
	};

	editor.clearText = function() {
		editorTextarea.value = '';
		editorTextarea.rows = 1;
	};

	editor.onTweetSend = function(tweetText) { };
};
