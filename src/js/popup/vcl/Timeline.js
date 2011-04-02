/**
 * Timeline visual object
 *
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

/**
 * @constructor
 */
twic.vcl.Timeline = function(parent) {

	var
		timeline = this,

		/** @type {Element} **/ wrapper      = twic.dom.expandElement('div.timeline'),
		/** @type {Element} **/ list         = twic.dom.expandElement('ul'),
		/** @type {Element} **/ loader       = twic.dom.expandElement('p.loader'),

		/** @type {Element} **/ tweetButtons = twic.dom.expandElement('div.tweetButtons'),
		/** @type {Element} **/ tbReply      = twic.dom.expandElement('img.tb_reply'),
		/** @type {Element} **/ tbRetweet    = twic.dom.expandElement('img.tb_retweet'),
		/** @type {Element} **/ tbUnRetweet  = twic.dom.expandElement('img.tb_retweet_undo'),
		/** @type {Element} **/ tbDelete     = twic.dom.expandElement('img.tb_delete'),
		/** @type {Element} **/ hoveredTweet,
		/** @type {DocumentFragment} **/ tweetBuffer,
		/** @type {boolean} **/ isLoading    = false,
		/** @type {Element} **/ tmp,

		/** @type {?string} **/ firstId,
		/** @type {?string} **/ lastId,

		/** @type {string}  **/ userNick,
		/** @type {number}  **/ userId,
		/** @type {Object.<string, twic.vcl.Tweet>} **/ tweets = {};

	var restoreButtonsSrc = function() {
		// @resource img/buttons/retweet.png
		tbRetweet.src   = 'img/buttons/retweet.png';
		// @resource img/buttons/retweet_undo.png
		tbUnRetweet.src = 'img/buttons/retweet_undo.png';
		// @resource img/buttons/delete.png
		tbDelete.src    = 'img/buttons/delete.png';
		// @resource img/buttons/reply.png
		tbReply.src   = 'img/buttons/reply.png';
	};

	var doButtonLoad = function(button) {
		// @resource img/loader.gif
		button.src = 'img/loader.gif';
	};

	var hideButtons = function() {
		tweetButtons.style.display = 'none';
		hoveredTweet = null;
	};

	var timelineMouseOut = function(e) {
		if (
			tweetButtons !== e.toElement
			&& !twic.dom.isChildOf(e.toElement, tweetButtons)
			&& !twic.dom.isChildOf(e.toElement, list)
		) {
			hideButtons();
		}
	};

	var buttonPressed = false;
	var timelineMouseMove = function(e) {
		var find = e.target;

		if (!buttonPressed) {
			while (
				find
				&& find.nodeName !== 'LI'
				&& find.parentNode
			) {
				find = find.parentNode;
			}

			if (find && find !== hoveredTweet) {
				var tweet = tweets[find.id];

				if (!tweet.isReplying()) {
					hoveredTweet = find;

					restoreButtonsSrc();

					tweetButtons.style.display = 'none';
					tweetButtons.style.top = (hoveredTweet.offsetTop + hoveredTweet.offsetHeight - tweetButtons.offsetHeight - 22) + 'px';

					var
						vReply     = twic.dom.setVisibility(tbReply, tweet.getCanReply()),
						vRetweet   = twic.dom.setVisibility(tbRetweet, tweet.getCanRetweet()),
						vUnRetweet = twic.dom.setVisibility(tbUnRetweet, tweet.getCanUnRetweet()),
						vDelete    = twic.dom.setVisibility(tbDelete, tweet.getCanDelete());

					if (vReply || vRetweet || vUnRetweet || vDelete) {
						tweetButtons.style.display = 'block';
					}
				}
			}
		}
	};

	var clickTimer;
	var timelineMouseDown = function(e) {
		clickTimer = setTimeout( function() {
			if (hoveredTweet) {
				tweetButtons.style.display = 'none';
				hoveredTweet = null;
			}

			buttonPressed = true;
		}, 250 );
	};

	var timelineMouseUp = function(e) {
		if (clickTimer) {
			clearTimeout(clickTimer);
		}

		buttonPressed = false;
	};


	/**
	 * Start the update
	 * @param {boolean=} isBottom Show animation at the bottom of timeline?
	 */
	timeline.beginUpdate = function(isBottom) {
		if (isBottom) {
			wrapper.appendChild(loader);
		} else {
			wrapper.insertBefore(loader, list);
		}

		tweetBuffer = document.createDocumentFragment();

		isLoading = true;
	};

	/**
	 * Stop the loading
	 */
	timeline.endUpdate = function() {
		isLoading = false;

		if (tweetBuffer.childNodes.length > 0) {
			list.appendChild(tweetBuffer);
			tweetBuffer = null;
		}

		twic.dom.removeElement(loader);
	};

	/**
	 * Clear the timeline
	 */
	timeline.clear = function() {
		list.innerHTML = '';
		tweets = { };

		lastId = null;
		firstId = null;
	};

	/**
	 * Add tweet to timeline
	 * @param {string} id Tweet identifier
	 * @return {!twic.vcl.Tweet}
	 */
	timeline.addTweet = function(id) {
		var
			tweet = new twic.vcl.Tweet(id, timeline);

		tweets[id] = tweet;

		if (
			!lastId
			|| id > lastId
		) {
			lastId = id;
		}

		if (
			!firstId
			|| id < firstId
		) {
			firstId = id;
		}

		if (isLoading) {
			tweetBuffer.appendChild(tweet.getElement());
		} else {
			list.appendChild(tweet.getElement());
		}

		return tweet;
	};

	/**
	 * @param {number} id User identifier
	 */
	timeline.setUserId = function(id) {
		userId = id;
	};

	/**
	 * @param {string} nick User nick
	 */
	timeline.setUserNick = function(nick) {
		userNick = nick;
	};

	/**
	 * @return {number} User identifier
	 */
	timeline.getUserId = function() {
		return userId;
	};

	/**
	 * @return {string} User nick
	 */
	timeline.getUserNick = function() {
		return userNick;
	};

	/**
	 * @return {?string} Last tweet identifier
	 */
	timeline.getLastId = function() {
		return lastId;
	};

	/**
	 * @return {?string} First tweet identifier
	 */
	timeline.getFirstId = function() {
		return firstId;
	};

	timeline.onRetweet = function(userId, tweetId, callback) { };

	var doRetweet = function() {
		if (hoveredTweet) {
			doButtonLoad(tbRetweet);

			timeline.onRetweet(userId, hoveredTweet.id, restoreButtonsSrc);
		}
	};

	timeline.onDelete = function(userId, tweetId, callback) { };

	var doDelete = function() {
		if (hoveredTweet) {
			doButtonLoad(tbDelete);
			doButtonLoad(tbUnRetweet);

			timeline.onDelete(userId, hoveredTweet.id, restoreButtonsSrc);
		}
	};

	var doReply = function() {
		if (hoveredTweet) {
			tweets[hoveredTweet.id].reply();
			hideButtons();
		}
	};

	// init

	tbReply.title = twic.utils.lang.translate('title_reply');
	tbReply.onclick = doReply;
	tweetButtons.appendChild(tbReply);

	tbRetweet.title = twic.utils.lang.translate('title_retweet');
	tbRetweet.onclick = doRetweet;
	tweetButtons.appendChild(tbRetweet);

	tbUnRetweet.title = twic.utils.lang.translate('title_retweet_undo');
	tbUnRetweet.onclick = doDelete; // the same handler is for delete
	tweetButtons.appendChild(tbUnRetweet);

	tbDelete.title = twic.utils.lang.translate('title_delete');
	tbDelete.onclick = doDelete;
	tweetButtons.appendChild(tbDelete);

	wrapper.appendChild(list);
	wrapper.appendChild(tweetButtons);
	parent.appendChild(wrapper);

	restoreButtonsSrc();

	list.addEventListener('mousedown', timelineMouseDown, false);
	list.addEventListener('mouseup', timelineMouseUp, false);
	list.addEventListener('mousemove', timelineMouseMove, false);
	list.addEventListener('mouseout', timelineMouseOut, false);

};
