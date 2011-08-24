/**
 * Common objects to pass in function
 *
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

twic.cobj = { };

/**
 * @constructor
 */
twic.cobj.Tweet = function() {
	/** @type {string} */ this.text = '';
	this.coords = {
		/** @type {boolean} */ enabled: false,
		/** @type {number}  */ lat: 0,
		/** @type {number}  */ lng: 0
	};
};