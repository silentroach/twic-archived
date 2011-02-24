/**
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

/**
 * @constructor
 */
twic.db.obj.Account = function() {
	this.table = 'accounts';
	this.fields = {
		'id': 0, 
		'oauth_token': '',
		'oauth_token_secret': ''
	};
};

twic.extend(twic.db.obj.Account, twic.DBObject);

/**
 * Sign the private API request
 * @param {twic.Request} req Request
 */
twic.db.obj.Account.prototype.signRequest = function(req) {

};