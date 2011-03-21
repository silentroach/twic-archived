/**
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

/**
 * @constructor
 * @extends twic.DBObject
 */
twic.db.obj.Tweet = function() {
	twic.DBObject.call(this);

	this.table = 'tweets';
	this.fields = {
		'id': '',
		'user_id': 0,
		'reply_to': '',
		'dt': twic.utils.date.getCurrentTimestamp(),
		'retweeted_user_id': null,
		'msg': ''
	};

	this.jsonMap = {
		'id': function(obj) {
			return obj['id_str'];
		},
		'msg': function(obj) {
			return obj['retweeted_status'] ? obj['retweeted_status']['text'] : obj['text'];
		},
		'reply_to': 'in_reply_to_status_id', // fixme id_str?!
		'dt': function(obj) {
			return twic.utils.date.getTimestamp(new Date(obj['created_at']));
		},
		'user_id': function(obj) {
			return obj['user']['id'];
		},
		'retweeted_user_id': function(obj) {
			return obj['retweeted_status'] ? obj['retweeted_status']['user']['id'] : null;
		}
	};
};

goog.inherits(twic.db.obj.Tweet, twic.DBObject);
