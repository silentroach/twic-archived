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

		/** @type {Element} **/ wrapper = twic.dom.expand('ul.timeline'),
		/** @type {string}  **/ userNick,
		/** @type {number}  **/ userId,
		/** @type {Object.<string, twic.vcl.Tweet>} **/ tweets = {};

	parent.appendChild(wrapper);

	/**
	 * Hide the tweet buttons
	 * @param {string=} exceptId Except the tweet with id
	 */
	timeline.hideTweetButtons = function(exceptId) {
		var
			/** @type {string} **/ key;

		for (key in tweets) {
			if (key !== exceptId) {
				tweets[key].hideButtons();
			}
		}
	};

	/**
	 * @param {Element} element Element ;)
	 * @return {string}
	 */
	var getTweetId = function(element) {
		var
			tmp = element,
			/** @type {twic.vcl.Tweet} **/ tweet;

		if (tmp.nodeName === 'P') {
			tmp = tmp.parentNode;
		}

		if (
			tmp.nodeName === 'LI'
			&& tweets[tmp.id]
		) {
			return tmp.id;
		}
	};

	var onTweetContext = function(e) {
		var
			id = getTweetId(e.target),
			tweet;

		if (id) {
			tweet = tweets[id];

			timeline.hideTweetButtons(id);
			tweet.showButtons();
		}
	};

	var onTweetClick = function(e) {
		var
			id = getTweetId(e.target);

		if (id) {
			timeline.hideTweetButtons();
		}
	};

	/**
	 * @param {!twic.vcl.Tweet} tweet Tweet
	 */
	timeline.addTweet = function(tweet) {
		tweets[tweet.getId()] = tweet;

		wrapper.appendChild(tweet.getElement());

		wrapper.addEventListener('click', onTweetClick, false);
		wrapper.addEventListener('contextmenu', onTweetContext, false);
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

};

