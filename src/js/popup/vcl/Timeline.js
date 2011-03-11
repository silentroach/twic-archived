/**
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

/**
 * @constructor
 */
twic.vcl.Timeline = function(parent) {

	var
		wrapper = document.createElement('ul'),
		tweets  = [],
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
	 * @return {number} User identifier
	 */
	var getUserId = function() {
		return userId;
	};

	return {
		addTweet: addTweet,

		setUserId: setUserId,

		getUserId: getUserId
	};

};
