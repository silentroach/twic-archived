/**
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

/**
 * Some utils
 */

twic.utils = { };

twic.utils.date = { };

/**
 * Get the timestamp from Date
 * @param {Date} dt Date
 * @return {number} Timestamp
 */
twic.utils.date.getTimestamp = function(dt) {
	return Math.floor(dt.getTime() / 1000);
};

/**
 * Get the current timestamp
 * @return {number} Timestamp
 */
twic.utils.date.getCurrentTimestamp = function() {
	return twic.utils.date.getTimestamp(new Date());
};
