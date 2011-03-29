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

	var onTweetClick = function(e) {
		var
			id = getTweetId(e.target);

		if (id) {
			timeline.hideTweetButtons();

			tweets[id].select();
		}
	};

	wrapper.addEventListener('click', onTweetClick, false);

	/**
	 * Add tweet to timeline
	 * @param {string} id Tweet identifier
	 * @return {!twic.vcl.Tweet}
	 */
	timeline.addTweet = function(id) {
		var
			tweet = new twic.vcl.Tweet(id, timeline);

		tweets[id] = tweet;
		wrapper.appendChild(tweet.getElement());

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

};

