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
		editorWrapper  = document.createElement('div'),
		editorTextarea = document.createElement('textarea'),
		editorCounter  = document.createElement('span');

	editorWrapper.className = 'tweetEditor';
	editorTextarea.rows = 1;

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
			twic.dom(editorWrapper).addClass('overload');
		} else {
			twic.dom(editorWrapper).removeClass('overload');
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
			return;
		}
	};

	editorTextarea.onfocus = function() {
		twic.dom(editorWrapper).addClass('focused');
	};

	editorTextarea.onblur = function() {
		twic.dom(editorWrapper).removeClass('focused');
	};

	// functions

	editor.setPlaceholder = function(alias) {
		editorTextarea.placeholder = chrome.i18n.getMessage(alias);
	};
};
