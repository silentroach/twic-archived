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
		/** @type {number}  **/ userId;

	parent.appendChild(wrapper);

	/**
	 * @param {!twic.vcl.Tweet} tweet Tweet
	 */
	timeline.addTweet = function(tweet) {
		wrapper.appendChild(tweet.getElement());
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

