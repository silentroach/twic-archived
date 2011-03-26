/**
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

/**
 * @constructor
 * @extends twic.DBObject
 */
twic.db.obj.Friend = function() {
	twic.DBObject.call(this);

	this.table = 'friends';
	this.fields = {
		'source_user_id': 0,
		'target_user_id': 0,
		'following': 0,
		'followed': 0,
		'dt': twic.utils.date.getCurrentTimestamp(),
	};

	this.jsonMap = {
		'following': function(obj) {
			return (obj['following']) ? 1 : 0;
		},
		'followed': function(obj) {
			return (obj['followed']) ? 1 : 0;
		}
	};
};

goog.inherits(twic.db.obj.Friend, twic.DBObject);

/**
 * Overriden save method to update the dt field (friend info last update time)
 * @param {function()} callback Callback function
 * @override
 */
twic.db.obj.Friend.prototype.save = function(callback) {
	var
		self = this;

	self.fields['dt'] = twic.utils.date.getCurrentTimestamp();

	twic.DBObject.prototype.save.call(self, callback);
};
