/**
 * User DB object
 *
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

/**
 * @constructor
 * @extends twic.DBObject
 */
twic.db.obj.User = function() {
	var self = this;

	twic.DBObject.call(self);

	self.table = 'users';
	self.fields = {
		'id': 0,
		'name': '',
		'screen_name': '',
		'avatar': '',
		'url': '',
		'verified': 0,
		'followers_count': 0,
		'friends_count': 0,
		'statuses_count': 0,
		'description': '',
		'regdate': twic.utils.date.getCurrentTimestamp(),
		'dt': twic.utils.date.getCurrentTimestamp()
	};

	self.jsonMap = {
		'avatar': 'profile_image_url',
		'verified': function(obj) {
			return (obj['verified']) ? 1 : 0;
		},
		// make the screen_name lowercase to search it right
		'screen_name': function(obj) {
			return obj['screen_name'].toLowerCase();
		},
		'regdate': function(obj) {
			return twic.utils.date.getTimestamp(new Date(obj['created_at']));
		}
	};
};

goog.inherits(twic.db.obj.User, twic.DBObject);

/**
 * Overriden save method to update the dt field (user info last update time)
 * @param {function()} callback Callback function
 * @override
 */
twic.db.obj.User.prototype.save = function(callback) {
	var
		self = this;

	self.fields['dt'] = twic.utils.date.getCurrentTimestamp();

	twic.DBObject.prototype.save.call(self, callback);
};
