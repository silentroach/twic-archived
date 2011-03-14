/**
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

twic.vcl = twic.vcl || { };

// todo reorder this peace of shit
// todo save textarea contents to localStorage to avoid data loss on popup close

/**
 * @constructor
 */
twic.vcl.TweetEditor = function(parent) {

	// init

	var
		editor = this,
		/** @type {HTMLDivElement}      **/ editorWrapper  = document.createElement('div'),
		/** @type {HTMLTextAreaElement} **/ editorTextarea = document.createElement('textarea'),
		/** @type {HTMLTextAreaElement} **/ editorSend     = document.createElement('input'),
		/** @type {HTMLElement}         **/ editorCounter  = document.createElement('span'),
		/** @type {HTMLElement}         **/ clearer        = document.createElement('div'),
		/** @type {number}              **/ charCount      = 0,

		/** @const **/ overloadClass = 'overload',
		/** @const **/ focusedClass  = 'focused',
		/** @const **/ sendingClass  = 'sending';

	editorWrapper.className = 'tweetEditor';

	editorSend.type  = 'button';
	editorSend.value = chrome.i18n.getMessage('button_send');
	editorSend.title = chrome.i18n.getMessage('hint_button_send');

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
		if (editorWrapper.classList.contains(sendingClass)) {
			return;
		}

		charCount = editorTextarea.value.length;

		// todo think about rows count decrement when it is needed
		while (editorTextarea.scrollTop > 0) {
			++editorTextarea.rows;
		}

		editorCounter.innerHTML = (140 - charCount).toString();

		if (charCount > 140) {
			editorWrapper.classList.add(overloadClass);
		} else {
			editorWrapper.classList.remove(overloadClass);
		}

		editorSend.disabled = (charCount === 0 || charCount > 140);
	};

	// check the textarea for chars count
	editorTextarea.onkeyup = function(e) {
		checkTweetArea();
	};

	/**
	 * Try to send the tweet
	 */
	var tryToSend = function() {
		/** @type {string} **/ var val = editorTextarea.value;

		if (val.length > 0) {
			// loading state

			editorWrapper.classList.add(sendingClass);
			editorCounter.innerHTML = '&nbsp;';
			editorSend.disabled = true;

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
		editorWrapper.classList.add(focusedClass);
		checkTweetArea();
	};

	editorTextarea.onblur = function() {
		if (editorTextarea.value.length === 0) {
			editorTextarea.rows = 1;
		}
	};

	editorSend.onclick = function() {
		tryToSend();
	};

	// functions

	editor.setPlaceholder = function(alias) {
		editorTextarea.placeholder = chrome.i18n.getMessage(alias);
	};

	editor.reset = function() {
		editorTextarea.value = '';
		editorTextarea.rows = 1;

		editorCounter.innerHTML = '140';

		editorWrapper.classList.remove(focusedClass);
		editorWrapper.classList.remove(sendingClass);
	};

	editor.reset();

	editor.onTweetSend = function(tweetText) { };
};
