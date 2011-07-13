/**
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

// todo holy shit! reorder it

/**
 * @constructor
 * @param {number} userId User identifier (used to store backup textarea value)
 * @param {Element} parent Parent element
 * @param {string=} replyTo Identifier of reply to tweet
 */
twic.vcl.TweetEditor = function(userId, parent, replyTo) {

	var
		editor = this,
		/** @type {Storage} **/ storage         = window.localStorage,
		/** @type {Element} **/ editorWrapper   = twic.dom.expandElement('div.tweetEditor'),
		/** @type {Element} **/ editorTextarea  = twic.dom.expandElement('textarea'),
		/** @type {Element} **/ editorSend      = twic.dom.expandElement('input'),
		/** @type {Element} **/ editorAttach    = twic.dom.expandElement('img'),
		/** @type {Element} **/ rightButtons    = twic.dom.expandElement('div.rb'),
		/** @type {Element} **/ editorCounter   = twic.dom.expandElement('span'),
		/** @type {Element} **/ clearer         = twic.dom.expandElement('div.clearer'),
		/** @type {Element} **/ suggestNickList = twic.dom.expandElement('ul.suggest'),
		/** @type {number}  **/ charCount       = 0,

		/** @type {string}  **/ constStartVal = '',

		/** @const **/ overloadClass = 'overload',
		/** @const **/ focusedClass  = 'focused',
		/** @const **/ sendingClass  = 'sending';

	/** @type {boolean} **/ editor.autoRemovable = false;

	editorTextarea['spellcheck'] = false;
	editorTextarea.placeholder = twic.utils.lang.translate(replyTo ? 'placeholder_tweet_reply' : 'placeholder_tweet_new');

	// @resource img/buttons/attach.png
	editorAttach.src = 'img/buttons/attach.png';
	editorAttach.classList.add('attach');

	if (!twic.vcl.TweetEditor.currentURL) {
		editorAttach.title = twic.utils.lang.translate('title_attach_link_disabled');

		editorAttach.classList.add('disabled');
	} else {
		editorAttach.title = twic.utils.lang.translate('title_attach_link');
	}

	editorSend.type  = 'button';
	editorSend.value = twic.utils.lang.translate(replyTo ? 'button_reply' : 'button_send');
	editorSend.title = twic.utils.lang.translate('title_button_send');

	rightButtons.appendChild(editorAttach);
	rightButtons.appendChild(editorSend);

	editorWrapper.appendChild(editorTextarea);
	editorWrapper.appendChild(suggestNickList);
	editorWrapper.appendChild(editorCounter);
	editorWrapper.appendChild(rightButtons);
	editorWrapper.appendChild(clearer);

	if (parent.childElementCount > 0) {
		parent.insertBefore(editorWrapper, parent.firstChild);
	} else {
		parent.appendChild(editorWrapper);
	}

	if (twic.vcl.TweetEditor.currentURL) {
		editorAttach.addEventListener('click', function() {
			var
				url = twic.vcl.TweetEditor.currentURL,
				selStart = editorTextarea.selectionStart,
				selEnd = editorTextarea.selectionEnd,
				valLen = editorTextarea.value.length,
				newVal = editorTextarea.value.substr(0, selStart);

			if (
				newVal.length > 0
				&& ' ' !== newVal.substr(-1)
			) {
				newVal += ' ';
			}

			newVal += url;

			if (' ' !== editorTextarea.value.substr(selEnd).substr(0, 1)) {
				newVal += ' ';
			}

			selStart = newVal.length;

			newVal += editorTextarea.value.substr(selEnd);

			editorTextarea.value = newVal;

			editorTextarea.selectionStart = selStart;
			editorTextarea.selectionEnd = selStart;

			editorTextarea.focus();
		}, false );
	};

	var
		suggestVisible = false,
		suggestPart = '';

	var suggestRemove = function() {
		twic.dom.setVisibility(suggestNickList, false);
		suggestNickList.innerHTML = '';
		suggestVisible = false;
		suggestPart = '';
	};

	var buildSuggestList = function(data, len) {
		var
			nickBuffer = document.createDocumentFragment(),
			el, i;

		for (i = 0; i < data.length; ++i) {
			var
				nick = data[i];

			el = twic.dom.expandElement('li');
			el.innerHTML = '<u>' + nick.substr(0, len) + '</u>' + nick.substr(len);
			nickBuffer.appendChild(el);
		}

		suggestNickList.innerHTML = '';
		suggestNickList.appendChild(nickBuffer);

		twic.dom.setVisibility(suggestNickList, true);
		suggestVisible = true;
	};

	var extractNickPart = function() {
		var
			val = editorTextarea.value,
			valLen = val.length,
			pos = editorTextarea.selectionEnd - 1,
			startPos = pos,
			nickChar = '',
			nickPart = '',
			res = {
				beg: -1,
				end: -1,
				success: false,
				part: ''
			};

		while (pos > -1 && ' ' !== nickChar) {
			nickChar = val.substr(pos--, 1);
			nickPart = nickChar + nickPart;
		}

		nickPart = nickPart.trim();

		if (
			0 === nickPart.length
			|| '@' !== nickPart.substr(0, 1)
		) {
			return res;
		}

		pos = startPos + 1;
		nickChar = '';

		while (pos < valLen && ' ' !== nickChar) {
			nickChar = val.substr(pos++, 1);
			nickPart += nickChar;
		}

		if ('@' === nickPart) {
			return res;
		}

		res.success = true;
		res.part = nickPart.substr(1).toLowerCase();

		return res;
	};

	var suggestCheck = function() {
		if (editorTextarea.selectionStart !== editorTextarea.selectionEnd) {
			if (suggestVisible) {
				suggestRemove();
			}

			return true;
		}

		var
			nickPart = extractNickPart();

		if (!nickPart.success) {
			if (suggestVisible) {
				suggestRemove();
			}

			return true;
		}

		if (suggestPart !== nickPart.part) {
			editor.onGetSuggestList(nickPart.part, function(data) {
				if (0 === data.length) {
					if (suggestVisible) {
						suggestRemove();
					}

					return true;
				}

				buildSuggestList(data, nickPart.part.length);
				suggestPart = nickPart.part;
			} );
		}
	};

	var checkTweetArea = function() {
		var val = editorTextarea.value;

		if (editorWrapper.classList.contains(sendingClass)) {
			return;
		}

		if (val.substring(0, constStartVal.length) !== constStartVal) {
			editorTextarea.value = constStartVal;
			editorTextarea.selectionStart = editorTextarea.selectionEnd = constStartVal.length;
			val = constStartVal;
		}

		charCount = val.length;

		while (
			editorTextarea.rows > 1
			&& editorTextarea.scrollHeight <= editorTextarea.offsetHeight
		) {
			--editorTextarea.rows;
		}

		while (editorTextarea.scrollHeight > editorTextarea.offsetHeight) {
			++editorTextarea.rows;
		}

		editorCounter.innerHTML = (140 - charCount).toString();

		if (charCount > 140) {
			editorWrapper.classList.add(overloadClass);
		} else {
			editorWrapper.classList.remove(overloadClass);
		}

		editorSend.disabled = (
			charCount === 0
			|| charCount > 140
			|| val === constStartVal
		);
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

			editor.onTweetSend(editor, val, replyTo, function() {
				editor.reset();

				if (editor.autoRemovable) {
					editor.close();
				}
			} );
		}
	};

	/**
	 * Function to get the path to localStorage element
	 * @return {string}
	 */
	var getStoragePath = function() {
		// todo append the tweet id if editor is for composing the reply
		return 'tweetEditor_' + userId + (replyTo ? '_' + replyTo : '');
	};

	// store the textarea value on each keyup to avoid data loss on popup close
	editorTextarea.addEventListener('keyup', function(e) {
		var
			val  = editorTextarea.value,
			path = getStoragePath();

		checkTweetArea();
		suggestCheck();

		if (
			val === ''
			|| val === constStartVal
			|| val.length < constStartVal.length
		) {
			storage.removeItem(path);
		} else {
			storage.setItem(path, val);
		}
	}, false );

	// prevent user to press enter
	editorTextarea.addEventListener('keydown', function(e) {
		if (13 === e.keyCode) {
			e.preventDefault();

			if (
				e.ctrlKey
				&& charCount > 0
				&& charCount < 141
			) {
				tryToSend();
			}
		}
	}, false );

	var handleOutClick = function(e) {
		if (
			editorWrapper.classList.contains(focusedClass)
			&& !twic.dom.isChildOf(e.target, editorWrapper)
		) {
			editorWrapper.classList.remove(focusedClass);
		}
	};

	document.addEventListener('click', handleOutClick, false);

	editorTextarea.addEventListener('focus', function(e) {
		editorWrapper.classList.add(focusedClass);
		checkTweetArea();

		editor.onFocus();
	}, false );

	editorSend.addEventListener('click', function() {
		tryToSend();
	}, false );

	var reset = function() {
		editorTextarea.value = '';
		editorTextarea.rows = 1;

		editorCounter.innerHTML = '140';

		editorWrapper.classList.remove(focusedClass);
		editorWrapper.classList.remove(sendingClass);
	};

	// init

	reset();

	var backupText = storage.getItem(getStoragePath());
	if (backupText) {
		editorTextarea.value = backupText;
		// fixme ugly timeout to resize textarea after ui is loaded
		setTimeout( function() {
			checkTweetArea();
		}, 200);
	}

	// functions

	editor.reset = function() {
		// empty the localstorage backup
		storage.removeItem(getStoragePath());

		reset();
	};

	editor.setText = function(text) {
		constStartVal = '';
		editorTextarea.value = text;
	};

	editor.setConstTextIfEmpty = function(text) {
		if (editorTextarea.value === '') {
			constStartVal = text;
			editorTextarea.value = text;
		}
	};

	/**
	 * @param {boolean=} setstart Set the cursor to the start
	 */
	editor.setFocus = function(setstart) {
		editorTextarea.selectionStart = setstart ? 0 : editorTextarea.selectionEnd = editorTextarea.value.length;
		editorTextarea.focus();
	};

	editor.close = function() {
		document.removeEventListener('click', handleOutClick, false);

		twic.dom.removeElement(editorWrapper);

		editor.onClose();
	};

};

// --------------------------------------
// current url to paste it into the tweet
// --------------------------------------
twic.vcl.TweetEditor.currentURL = false;

chrome.tabs.getSelected( null, function(tab) {
	if (tab) {
		var
			url = tab.url

		if (
			url.length > 4
			&& 'http' === url.substr(0, 4)
		) {
			twic.vcl.TweetEditor.currentURL = url;
		}
	}
} );

/**
 * Handler for tweet send process
 * @param {twic.vcl.TweetEditor} editor Editor
 * @param {string} tweetText Tweet text
 * @param {string=} replyTo Reply to tweet
 * @param {function()=} callback Callback for reset
 */
twic.vcl.TweetEditor.prototype.onTweetSend = function(editor, tweetText, replyTo, callback) { };

/**
 * Handler for the focus event
 */
twic.vcl.TweetEditor.prototype.onFocus = function() { };

/**
 * Close handler for tweet editor
 */
twic.vcl.TweetEditor.prototype.onClose = function() { };

/**
 * Get the suggest list
 * @param {string} startPart Start part of the nick
 * @param {function(Array)} callback Callback function
 */
twic.vcl.TweetEditor.prototype.onGetSuggestList = function(startPart, callback) {
	callback( [ ] );
};
