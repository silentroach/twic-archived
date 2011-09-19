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

/**
 * @constructor
 * @extends twic.Error
 * @param {number} code Error code
 * @param {XMLHttpRequest} req Request
 */
twic.ResponseError = function(code, req) {
	this.request = req;

	twic.Error.call(this, code);
};

goog.inherits(twic.ResponseError, twic.Error);

/** @const */ twic.ResponseError.UNKNOWN       = 0;
/** @const */ twic.ResponseError.UNAUTHORIZED  = 1;
/** @const */ twic.ResponseError.TIMEOUT       = 2;
/** @const */ twic.ResponseError.NOT_FOUND     = 3;
/** @const */ twic.ResponseError.NO_CONNECTOIN = 4;
