/**
 * Tweet editor
 *
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
		/** @type {Element} **/ editorSend      = twic.dom.expandElement('input'),
		/** @type {Element} **/ editorAttach    = twic.dom.expandElement('img'),
		/** @type {Element} **/ rightButtons    = twic.dom.expandElement('div.rb'),
		/** @type {Element} **/ editorCounter   = twic.dom.expandElement('span'),
		/** @type {Element} **/ clearer         = twic.dom.expandElement('div.clearer'),
		/** @type {Element} **/ suggestNickList = twic.dom.expandElement('ul.suggest'),
		/** @type {number}  **/ charCount       = 0;

	/** @type {boolean} **/ editor.autoRemovable = false;

	/**
	 * @type {string}
	 */
	this.constStartVal_ = '';

	/**
	 * @type {Element}
	 * @private
	 */
	this.editorTextarea_ = twic.dom.expandElement('textarea');

	this.editorTextarea_['spellcheck'] = false;
	this.editorTextarea_.placeholder = twic.utils.lang.translate(replyTo ? 'placeholder_tweet_reply' : 'placeholder_tweet_new');

	// @resource img/buttons/attach.png
	editorAttach.src = 'img/buttons/attach.png';
	editorAttach.classList.add('attach');

	if (!twic.vcl.TweetEditor.prototype.currentURL_) {
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

	editorWrapper.appendChild(this.editorTextarea_);
	editorWrapper.appendChild(suggestNickList);
	editorWrapper.appendChild(editorCounter);
	editorWrapper.appendChild(rightButtons);
	editorWrapper.appendChild(clearer);

	if (parent.childElementCount > 0) {
		parent.insertBefore(editorWrapper, parent.firstChild);
	} else {
		parent.appendChild(editorWrapper);
	}

	if (twic.vcl.TweetEditor.prototype.currentURL_) {
		editorAttach.addEventListener('click', function() {
			var
				url = twic.vcl.TweetEditor.prototype.currentURL_,
				selStart = editor.editorTextarea_.selectionStart,
				selEnd = editor.editorTextarea_.selectionEnd,
				valLen = editor.editorTextarea_.value.length,
				newVal = editor.editorTextarea_.value.substr(0, selStart);

			if (
				newVal.length > 0
				&& ' ' !== newVal.substr(-1)
			) {
				newVal += ' ';
			}

			newVal += url;

			if (' ' !== editor.editorTextarea_.value.substr(selEnd).substr(0, 1)) {
				newVal += ' ';
			}

			selStart = newVal.length;

			newVal += editor.editorTextarea_.value.substr(selEnd);

			editor.editorTextarea_.value = newVal;

			editor.editorTextarea_.selectionStart = selStart;
			editor.editorTextarea_.selectionEnd = selStart;

			editor.editorTextarea_.focus();
		}, false );
	}

	var
		suggestVisible = false,
		suggestFocused = false,
		suggestPart = '';

	var getSelectedSuggestElement = function() {
		return twic.dom.findElement('.selected', suggestNickList);
	};

	var resetSuggestSelection = function() {
		var
			selectedElement = getSelectedSuggestElement();

		if (selectedElement) {
			selectedElement.classList.remove('selected');
		}

		suggestFocused = false;
	};

	/**
	 * Move the suggest selection
	 * @param {boolean} onRight Move to the right?
	 */
	var moveSuggest = function(onRight) {
		var
			selectedElement = getSelectedSuggestElement(),
			trg;

		if (selectedElement) {
			trg = onRight ? selectedElement.nextElementSibling : selectedElement.previousElementSibling;
		}

		if (
			!selectedElement
			|| !trg
		) {
			trg = onRight ? suggestNickList.firstElementChild : suggestNickList.lastElementChild;
		}

		if (selectedElement) {
			selectedElement.classList.remove('selected');
		}

		if (trg) {
			trg.classList.add('selected');
		}
	};

	var focusSuggest = function() {
		suggestFocused = true;
		moveSuggest(true);
	};

	var suggestRemove = function() {
		twic.dom.setVisibility(suggestNickList, false);
		suggestNickList.innerHTML = '';
		suggestVisible = false;
		suggestFocused = false;
		suggestPart = '';
	};

	var suggestSelect = function() {
		var
			selectedElement = getSelectedSuggestElement(),
			nickPart = extractNickPart(),
			val = editor.editorTextarea_.value;

		if (!nickPart.success) {
			suggestRemove();
			return false;
		}

		var
			selectedNick = selectedElement.innerText;

		editor.editorTextarea_.value = val.substring(0, nickPart.beg) + '@' + selectedNick + val.substring(nickPart.end);
		editor.editorTextarea_.selectionEnd = editor.editorTextarea_.selectionStart = nickPart.beg + selectedNick.length + 1;

		suggestRemove();

		checkTweetArea();
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
		suggestFocused = false;
	};

	var extractNickPart = function() {
		var
			val = editor.editorTextarea_.value,
			valLen = val.length,
			pos = editor.editorTextarea_.selectionEnd - 1,
			startPos = pos,
			nickChar = '',
			nickPart = '',
			res = {
				beg: 0,
				end: valLen,
				success: false,
				part: ''
			};

		while (
			pos > -1
			&& '@' !== nickChar
			&& ' ' !== nickChar
		) {
			res.beg = pos;

			nickChar = val.substr(pos--, 1);
			nickPart = nickChar + nickPart;
		}

		if (
			pos > 0
			&& ' ' !== val.substr(pos, 1)
		) {
			return res;
		}

		if (
			0 === nickPart.length
			|| '@' !== nickPart.substr(0, 1)
		) {
			return res;
		}

		pos = startPos + 1;
		nickChar = '';

		while (pos < valLen && ' ' !== nickChar) {
			res.end = pos;

			nickChar = val.substr(pos++, 1);
			nickPart += nickChar;
		}

		nickPart = nickPart.trim();

		if ('@' === nickPart) {
			return res;
		}

		res.success = true;
		res.part = nickPart.substring(1).toLowerCase();

		return res;
	};

	var suggestCheck = function() {
		if (editor.editorTextarea_.selectionStart !== editor.editorTextarea_.selectionEnd) {
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
		var val = editor.editorTextarea_.value;

		if (editorWrapper.classList.contains(twic.vcl.TweetEditor.sendingClass)) {
			return;
		}

		if (val.substring(0, editor.constStartVal_.length) !== editor.constStartVal_) {
			editor.editorTextarea_.value = editor.constStartVal_;
			editor.editorTextarea_.selectionStart = editor.editorTextarea_.selectionEnd = editor.constStartVal_.length;
			val = editor.constStartVal_;
		}

		charCount = val.length;

		while (
			editor.editorTextarea_.rows > 1
			&& editor.editorTextarea_.scrollHeight <= editor.editorTextarea_.offsetHeight
		) {
			--editor.editorTextarea_.rows;
		}

		while (editor.editorTextarea_.scrollHeight > editor.editorTextarea_.offsetHeight) {
			++editor.editorTextarea_.rows;
		}

		editorCounter.innerHTML = (twic.vcl.TweetEditor.MAXCOUNT - charCount).toString();

		if (charCount > twic.vcl.TweetEditor.MAXCOUNT) {
			editorWrapper.classList.add(twic.vcl.TweetEditor.overloadClass);
		} else {
			editorWrapper.classList.remove(twic.vcl.TweetEditor.overloadClass);
		}

		editorSend.disabled = (
			charCount === 0
			|| charCount > twic.vcl.TweetEditor.MAXCOUNT
			|| val === editor.constStartVal_
		);
	};

	/**
	 * Try to send the tweet
	 */
	var tryToSend = function() {
		/** @type {string} **/ var val = editor.editorTextarea_.value;

		if (val.length > 0) {
			// loading state

			editorWrapper.classList.add(twic.vcl.TweetEditor.sendingClass);
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
	this.editorTextarea_.addEventListener('keyup', function(e) {
		if (13 === e.keyCode) {
			return false;
		}

		var
			val  = editor.editorTextarea_.value,
			path = getStoragePath();

		checkTweetArea();
		suggestCheck();

		if (
			val === ''
			|| val === editor.constStartVal_
			|| val.length < editor.constStartVal_.length
		) {
			storage.removeItem(path);
		} else {
			storage.setItem(path, val);
		}
	}, false );

	// prevent user to press enter
	this.editorTextarea_.addEventListener('keydown', function(e) {
		switch (e.keyCode) {
			// enter
			case 13:
				e.preventDefault();

				if (e.ctrlKey) {
					if (
						charCount > 0
						&& charCount < 141
					) {
						tryToSend();
					}
				} else
				if (
					suggestVisible
					&& suggestFocused
				) {
					suggestSelect();
				}

				break;
			// left
			case 37:
				if (
					suggestVisible
					&& suggestFocused
				) {
					e.preventDefault();
					moveSuggest(false);
				}

				break;
			// up
			case 38:
				if (
					suggestVisible
					&& suggestFocused
				) {
					e.preventDefault();
					resetSuggestSelection();
				}

				break;
			// right
			case 39:
				if (
					suggestVisible
					&& suggestFocused
				) {
					e.preventDefault();
					moveSuggest(true);
				}

				break;
			// down
			case 40:
				if (suggestVisible) {
					e.preventDefault();

					if (suggestFocused) {
						resetSuggestSelection();
					} else {
						focusSuggest();
					}
				}

				break;
		}
	}, false );

	var handleOutClick = function(e) {
		if (
			editorWrapper.classList.contains(twic.vcl.TweetEditor.focusedClass)
			&& !twic.dom.isChildOf(e.target, editorWrapper)
		) {
			editorWrapper.classList.remove(twic.vcl.TweetEditor.focusedClass);
		}
	};

	this.editorTextarea_.addEventListener('focus', function(e) {
		editorWrapper.classList.add(twic.vcl.TweetEditor.focusedClass);
		checkTweetArea();

		editor.onFocus();
	}, false );

	editorSend.addEventListener('click', function() {
		tryToSend();
	}, false );

	var reset = function() {
		editor.editorTextarea_.value = '';
		editor.editorTextarea_.rows = 1;
		editor.editorTextarea_.blur();

		editorCounter.innerHTML = twic.vcl.TweetEditor.MAXCOUNT.toString();

		editorWrapper.classList.remove(twic.vcl.TweetEditor.focusedClass);
		editorWrapper.classList.remove(twic.vcl.TweetEditor.sendingClass);
	};

	suggestNickList.addEventListener('click', function(e) {
		var
			selEl = getSelectedSuggestElement(),
			trgEl = e.target;

		e.preventDefault();
		e.stopPropagation();

		if ('LI' !== trgEl.tagName) {
			trgEl = trgEl.parentElement;
		}

		if (
			selEl
			&& selEl !== trgEl
		) {
			selEl.classList.remove('selected');
		}

		trgEl.classList.add('selected');

		suggestSelect();
	}, false );

	document.addEventListener('click', handleOutClick, false);

	// init

	reset();

	var backupText = storage.getItem(getStoragePath());
	if (backupText) {
		this.editorTextarea_.value = backupText;
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

	editor.close = function() {
		document.removeEventListener('click', handleOutClick, false);

		twic.dom.removeElement(editorWrapper);

		editor.onClose();
	};

};

/**
 * Current url to paste it into the tweet
 * @private
 */
twic.vcl.TweetEditor.prototype.currentURL_ = false;

chrome.tabs.getSelected( null, function(tab) {
	if (tab) {
		var
			url = tab.url;

		if (
			url.length > 4
			&& (
				'http' === url.substr(0, 4)
				|| 'ftp' === url.substr(0, 3)
			)
		) {
			twic.vcl.TweetEditor.prototype.currentURL_ = url;
		}
	}
} );

// ------------------------------------------

/** @const **/ twic.vcl.TweetEditor.overloadClass = 'overload',
/** @const **/ twic.vcl.TweetEditor.focusedClass  = 'focused',
/** @const **/ twic.vcl.TweetEditor.sendingClass  = 'sending';
/** @const **/ twic.vcl.TweetEditor.MAXCOUNT = 140;

/**
 * @param {boolean=} setstart Set the cursor to the start
 */
twic.vcl.TweetEditor.prototype.setFocus = function(setstart) {
	this.editorTextarea_.selectionStart = setstart ? 0 : this.editorTextarea_.selectionEnd = this.editorTextarea_.value.length;
	this.editorTextarea_.focus();
};

/**
 * Set the editor text
 * @param {string} text Tweet text
 */
twic.vcl.TweetEditor.prototype.setText = function(text) {
	this.constStartVal_ = '';
	this.editorTextarea_.value = text;
};

/**
 * Set the constant editor text
 * @param {string} text Constant tweet part
 */
twic.vcl.TweetEditor.prototype.setConstTextIfEmpty = function(text) {
	if (this.editorTextarea_.value === '') {
		this.constStartVal_ = text;
		this.editorTextarea_.value = text;
	}
};

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
