/**
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

/**
 * @constructor
 */
twic.db.obj.Tweet = function() {
	this.table = 'tweets';
	this.fields = {
		'id': 0, 
		'user_id': 0,
		'reply_to': '',
		'dt': twic.utils.getCurrentTimestamp(),
		'msg': ''
	};
};
	
twic.utils.extend(twic.db.obj.Tweet, twic.DBObject);