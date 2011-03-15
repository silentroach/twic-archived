/**
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

/**
 * @constructor
 * todo annotations?
 */
twic.vcl.Timeline = function(parent) {

	var
		wrapper = document.createElement('ul'),
		tweets  = [],
		userNick,
		userId;

	wrapper.className = 'timeline';

	parent.appendChild(wrapper);

	/**
	 * @param {!twic.vcl.Tweet} tweet Tweet
	 */
	var addTweet = function(tweet) {
		wrapper.appendChild(tweet.getElement());
	};

	/**
	 * @param {number} id User identifier
	 */
	var setUserId = function(id) {
		userId = id;
	};

	/**
	 * @param {string} nick User nick
	 */
	var setUserNick = function(nick) {
		userNick = nick;
	};

	/**
	 * @return {number} User identifier
	 */
	var getUserId = function() {
		return userId;
	};

	/**
	 * @return {string} User nick
	 */
	var getUserNick = function() {
		return userNick;
	};

	return {
		addTweet: addTweet,

		setUserId: setUserId,
		setUserNick: setUserNick,

		getUserId: getUserId,
		getUserNick: getUserNick
	};

};
