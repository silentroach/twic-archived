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
		'dt': twic.utils.date.getCurrentTimestamp()
	};

	this.jsonMap = {
		'source_user_id': 'id',
		'following': function(obj) {
			return (obj['following']) ? 1 : 0;
		},
		'followed': function(obj) {
			return (obj['followed_by']) ? 1 : 0;
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
		self = this,
		tmpFriend = new twic.db.obj.Friend(),
		key;

	self.fields['dt'] = twic.utils.date.getCurrentTimestamp();

	twic.DBObject.prototype.save.call(self, function() {
		tmpFriend.fields['following'] = self.fields['followed'];
		tmpFriend.fields['followed']  = self.fields['following'];
		tmpFriend.fields['source_user_id'] = self.fields['target_user_id'];
		tmpFriend.fields['target_user_id'] = self.fields['source_user_id'];

		twic.DBObject.prototype.save.call(tmpFriend, callback);
	} );
};

/**
 * Remove the item
 * @override
 * @param {function()} callback Callback function
 */
twic.db.obj.Friend.prototype.remove = function(callback) {
	var
		self = this;

	// fixme -> execQueries
	twic.utils.queueIterator( [
		'delete from ' + self.table + ' where source_user_id = ? and target_user_id = ?',
		'delete from ' + self.table + ' where target_user_id = ? and source_user_id = ?'
	], function(sqlText, callback) {
		twic.db.execQuery(sqlText, [
			self.fields['source_user_id'],
			self.fields['target_user_id']
		], callback);
	}, callback);
};

/**
 * Load object from JSON
 * @override
 * @param {Object} obj JSON object
 */
twic.db.obj.Friend.prototype.loadFromJSON = function(obj) {
	var
		self = this;

	twic.DBObject.prototype.loadFromJSON.call(self, obj['source']);

	self.fields['target_user_id'] = obj['target']['id'];
};
