/**
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

/**
 * @constructor
 * @extends twic.DBObject
 */
twic.db.obj.Account = function() {
	var self = this;

	twic.DBObject.call(self);

	/** @const **/ self.table = 'accounts';
	self.fields = {
		'id': 0,
		'oauth_token': '',
		'oauth_token_secret': '',
		'unread_tweets_count': 0,
		'unread_messages_count': 0
	};
};

goog.inherits(twic.db.obj.Account, twic.DBObject);

// todo is it right to declare handlers in this way?
twic.db.obj.Account.prototype.onUnreadTweetsCountChanged = function(newCount) {

};

twic.db.obj.Account.prototype.onUnreadMessagesCountChanged = function(newCount) {

};

twic.db.obj.Account.prototype.onFieldChanged = function(fieldName, newValue) {
	var account = this;

	if (fieldName === 'unread_tweets_count') {
		account.onUnreadTweetsCountChanged(newValue);
	} else
	if (fieldName === 'unread_messages_count') {
		account.onUnreadMessagesCountChanged(newValue);
	}
};
