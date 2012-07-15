/**
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

/**
 * @constructor
 * @extends twic.DBObject
 */
twic.db.obj.Account = function() {
    var
        accountObject = this;

    twic.DBObject.call(accountObject);

    accountObject.table = 'accounts';
    accountObject.fields = {
        'id': 0,
        'oauth_token': '',
        'oauth_token_secret': '',
        'unread_tweets_count': 0,
        'unread_mentions_count': 0,
        'unread_messages_count': 0
    };
};

goog.inherits(twic.db.obj.Account, twic.DBObject);

// todo is it right to declare handlers in this way?
twic.db.obj.Account.prototype.onUnreadTweetsCountChanged = function(newCount) { };

twic.db.obj.Account.prototype.onUnreadMessagesCountChanged = function(newCount) { };

twic.db.obj.Account.prototype.onUnreadMentionsCountChanged = function(newCount) { };

twic.db.obj.Account.prototype.onFieldChanged = function(fieldName, newValue) {
    var
        accountObject = this;

    switch (fieldName) {
        case 'unread_tweets_count':
            accountObject.onUnreadTweetsCountChanged(newValue);
            break;
        case 'unread_mentions_count':
            accountObject.onUnreadMentionsCountChanged(newValue);
            break;
        case 'unread_messages_count':
            accountObject.onUnreadMessagesCountChanged(newValue);
            break;
    }
};
