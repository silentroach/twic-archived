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

		/** @type {Element} **/ wrapper      = twic.dom.expand('div.timeline'),
		/** @type {Element} **/ list         = twic.dom.expand('ul'),
		/** @type {Element} **/ loader       = twic.dom.expand('p.loader'),

		/** @type {Element} **/ tweetButtons = twic.dom.expand('div.tweetButtons'),
		/** @type {Element} **/ tbReply      = twic.dom.expand('img.tb_reply'),
		/** @type {Element} **/ tbRetweet    = twic.dom.expand('img.tb_retweet'),
		/** @type {DocumentFragment} **/ tweetBuffer,
		/** @type {boolean} **/ isLoading    = false,
		/** @type {Element} **/ tmp,

		/** @type {string}  **/ firstId,
		/** @type {string}  **/ lastId,

		/** @type {string}  **/ userNick,
		/** @type {number}  **/ userId,
		/** @type {Object.<string, twic.vcl.Tweet>} **/ tweets = {};

	tmp = twic.dom.expand('div');

	tbReply.src   = '/img/buttons/reply.png';
	tbReply.title = twic.utils.lang.translate('title_reply');
	tmp.appendChild(tbReply);
	
	tbRetweet.src   = '/img/buttons/retweet.png';
	tbRetweet.title = twic.utils.lang.translate('title_retweet');
	tmp.appendChild(tbRetweet);

	tweetButtons.appendChild(tmp);

	wrapper.appendChild(list);
	wrapper.appendChild(tweetButtons);
	parent.appendChild(wrapper);

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

		twic.dom.remove(loader);
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
	 * @return {string} Last tweet identifier
	 */
	timeline.getLastId = function() {
		return lastId;
	};

	/**
	 * @return {string} First tweet identifier
	 */
	timeline.getFirstId = function() {
		return firstId;
	};

};
