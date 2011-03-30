/**
 * Error object
 *
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */
 
/**
 * @constructor
 * @param {number} code Code
 * @param {string=} message Message
 */
twic.Error = function(code, message) {
	this.code = code;
	this.message = message ? message : '';
};