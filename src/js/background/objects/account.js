/**
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

/**
 * @constructor
 */
twic.db.obj.Account = function() {
	twic.DBObject.call(this);

	this.table = 'accounts';
	this.fields = {
		'id': 0,
		'oauth_token': '',
		'oauth_token_secret': '',
		'unread_tweets_count': 0,
		'unread_messages_count': 0
	};
};

goog.inherits(twic.db.obj.Account, twic.DBObject);

twic.db.obj.Account.prototype.onUnreadTweetsCountChanged = function(newCount) {

};

twic.db.obj.Account.prototype.onUnreadMessagesCountChanged = function(newCount) {

};

twic.db.obj.Account.prototype.onFieldChange = function(fieldName, newValue) {
	var account = this;

	if (fieldName == 'unread_tweets_count') {
		account.onUnreadTweetsCountChanged(newValue);
	} else
	if (fieldName == 'unread_messages_count') {
		account.onUnreadMessagesCountChanged(newValue);
	}
};