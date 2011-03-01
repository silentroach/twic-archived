/**
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

twic.utils = { };

/**
 * Extend the object
 * @param {Object} Child Child object
 * @param {Object} Parent Parent object
twic.utils.extend = function(Child, Parent) {
	var F = function() { };
	F.prototype = Parent.prototype;
	Child.prototype = new F();
	Child.prototype.constructor = Child;
	Child.superclass = Parent.prototype;
};
*/

/**
 * Get the timestamp from Date
 * @param {Date} dt Date
 * @return {number} Timestamp
 */
twic.utils.getTimestamp = function(dt) {
	return Math.floor(dt.getTime() / 1000);
};

/**
 * Get the current timestamp
 * @return {number} Timestamp
 */
twic.utils.getCurrentTimestamp = function() {
	return goog.now();
	//return twic.utils.getTimestamp(new Date());
};
