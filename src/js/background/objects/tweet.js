/**
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

/**
 * @constructor
 */
twic.db.obj.Tweet = function() {
	twic.DBObject.call(this);

	this.table = 'tweets';
	this.fields = {
		'id': 0,
		'user_id': 0,
		'reply_to': '',
		'dt': twic.utils.date.getCurrentTimestamp(),
		'msg': ''
	};

	this.jsonMap = {
		'msg': 'text',
		'reply_to': 'in_reply_to_status_id',
		'dt': function(obj) {
			return twic.utils.date.getTimestamp(new Date(obj['created_at']));
		},
		'user_id': function(obj) {
			return obj['user']['id'];
		}
	};
};

goog.inherits(twic.db.obj.Tweet, twic.DBObject);
