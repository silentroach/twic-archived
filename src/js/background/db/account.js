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

twic.db.obj.Account.prototype = new twic.dbobject();
