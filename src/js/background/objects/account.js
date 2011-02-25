/**
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

/**
 * @constructor
 */
twic.db.obj.Account = function() {
	twic.db.obj.Account.superclass.constructor.call(this);

	this.table = 'accounts';
	this.fields = {
		'id': 0,
		'oauth_token': '',
		'oauth_token_secret': ''
	};
};

twic.utils.extend(twic.db.obj.Account, twic.DBObject);
