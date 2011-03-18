/**
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

/**
 * @constructor
 * @extends twic.DBObject
 */
twic.db.obj.User = function() {
	twic.DBObject.call(this);

	this.table = 'users';
	this.fields = {
		'id': 0,
		'name': '',
		'screen_name': '',
		'avatar': '',
		'url': '',
		'verified': '',
		'followers_count': 0,
		'friends_count': 0,
		'statuses_count': 0,
		'regdate': twic.utils.date.getCurrentTimestamp(),
		'dt': twic.utils.date.getCurrentTimestamp(),
		'scount': 0
	};

	this.jsonMap = {
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

// todo annotation is missing
twic.db.obj.User.prototype.save = function(callback) {
	// update for 'dt' each save method call
	this.fields['dt'] = twic.utils.date.getCurrentTimestamp();

	twic.DBObject.prototype.save.call(this, callback);
};
