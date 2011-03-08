/**
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

twic.vcl = twic.vcl || { };

/**
 * @constructor
 */
twic.vcl.TweetEditor = function(parent) {

	// init

	var
		editor = this,
		/** @type {HTMLDivElement}      **/ editorWrapper  = document.createElement('div'),
		/** @type {twic.dom}            **/ $editorWrapper = twic.dom(editorWrapper),
		/** @type {HTMLTextAreaElement} **/ editorTextarea = document.createElement('textarea'),
		/** @type {HTMLTextAreaElement} **/ editorSend     = document.createElement('input'),
		/** @type {HTMLElement}         **/ editorCounter  = document.createElement('span'),
		/** @type {HTMLElement}         **/ clearer        = document.createElement('div'),
		/** @type {number}              **/ charCount      = 0,

		/** @const **/ overloadClass = 'overload',
		/** @const **/ focusedClass  = 'focused';

	editorWrapper.className = 'tweetEditor';
	editorTextarea.rows = 1;
	editorCounter.innerHTML = '140';

	editorSend.type  = 'button';
	editorSend.value = chrome.i18n.getMessage('button_send');

	clearer.className = 'clearer';

	editorWrapper.appendChild(editorTextarea);
	editorWrapper.appendChild(editorSend);
	editorWrapper.appendChild(editorCounter);
	editorWrapper.appendChild(clearer);

	if (parent.childElementCount > 0) {
		parent.insertBefore(editorWrapper, parent.firstChild);
	} else {
		parent.appendChild(editorWrapper);
	}

	var checkTweetArea = function() {
		charCount = editorTextarea.value.length;

		while (editorTextarea.scrollTop > 0) {
			++editorTextarea.rows;
		}

		editorCounter.innerHTML = (140 - charCount).toString();

		if (charCount > 140) {
			$editorWrapper.addClass(overloadClass);
			editorSend.disabled = true;
		} else {
			$editorWrapper.removeClass(overloadClass);
			editorSend.disabled = false;
		}
	};

	// check the textarea for chars count
	editorTextarea.onkeyup = function(e) {
		checkTweetArea();
	};

	var tryToSend = function() {
		/** @tyoe {string} **/ var val = editorTextarea.value;

		if (val.length > 0) {
			editor.onTweetSend(val);
		}
	};

	// prevent user to press enter
	editorTextarea.onkeydown = function(e) {
		if (e.keyCode === 13) {
			e.preventDefault();

			if (
				e.ctrlKey
				&& charCount > 0
				&& charCount < 141
			) {
				tryToSend();
			}
		}
	};

	editorTextarea.onfocus = function() {
		$editorWrapper.addClass(focusedClass);
	};

	editorSend.onclick = tryToSend;

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
