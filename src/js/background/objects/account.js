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

twic.db.obj.Account.prototype = new twic.dbobject();

/**
 * Get the access token info
 * @return {Object} Info
 */
twic.db.obj.Account.prototype.getOAuthInfo = function() {
  return {
    token: this.fields['oauth_token'],
    token_secret: this.fields['oauth_token_secret']
  }
};
