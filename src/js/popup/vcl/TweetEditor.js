/**
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

// todo holy shit! reorder it

/**
 * @constructor
 * @param {number} userId User identifier (used to store backup textarea value)
 * @param {Element} parent Parent element
 * @param {number=} replyTo Identifier of reply to tweet
 */
twic.vcl.TweetEditor = function(userId, parent, replyTo) {

	// init

	var
		editor = this,
		/** @type {Storage} **/ storage        = window.localStorage,
		/** @type {Element} **/ editorWrapper  = document.createElement('div'),
		/** @type {Element} **/ editorTextarea = document.createElement('textarea'),
		/** @type {Element} **/ editorSend     = document.createElement('input'),
		/** @type {Element} **/ editorCounter  = document.createElement('span'),
		/** @type {Element} **/ clearer        = document.createElement('div'),
		/** @type {number}  **/ charCount      = 0,

		/** @const **/ overloadClass = 'overload',
		/** @const **/ focusedClass  = 'focused',
		/** @const **/ sendingClass  = 'sending';

	editorWrapper.className = 'tweetEditor';

	editorTextarea['spellcheck'] = false;

	editorSend.type  = 'button';
	editorSend.value = twic.utils.lang.translate('button_send');
	editorSend.title = twic.utils.lang.translate('title_button_send');

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

		if (val === '') {
			storage.removeItem(path);
		} else {
			storage.setItem(path, val);
		}
	}, false );

	// prevent user to press enter
	editorTextarea.addEventListener('keydown', function(e) {
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
	}, false );

	editorTextarea.addEventListener('focus', function() {
		editorWrapper.classList.add(focusedClass);
		checkTweetArea();
	}, false );

	editorTextarea.addEventListener('blur', function() {
		if (editorTextarea.value.length === 0) {
			editorTextarea.rows = 1;
		}
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
		// fixme textarea isn't resized if it is too big :(
		checkTweetArea();
	}

	// functions

	editor.setPlaceholder = function(alias) {
		editorTextarea.placeholder = twic.utils.lang.translate(alias);
	};

	editor.reset = function() {
		// empty the localstorage backup
		storage.removeItem(getStoragePath());

		reset();
	};

};

/**
 * Handler for tweet send process
 * @param {string} tweetText
 */
twic.vcl.TweetEditor.prototype.onTweetSend = function(tweetText) { };
