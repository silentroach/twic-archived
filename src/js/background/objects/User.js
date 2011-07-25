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
	twic.DBObject.call(this);

	this.table = 'users';
	this.fields = {
		'id': 0,
		'name': '',
		'screen_name': '',
		'screen_name_lower': '',
		'avatar': '',
		'url': '',
		'verified': 0,
		'is_protected': 0,
		'followers_count': 0,
		'friends_count': 0,
		'statuses_count': 0,
		'description': '',
		'location': '',
		'regdate': twic.utils.date.getCurrentTimestamp(),
		'dt': twic.utils.date.getCurrentTimestamp()
	};

	this.jsonMap = {
		'avatar': 'profile_image_url',
		'verified': function(obj) {
			return (obj['verified']) ? 1 : 0;
		},
		// make the screen_name lowercase to search it right
		'screen_name_lower': function(obj) {
			return obj['screen_name'].toLowerCase();
		},
		'regdate': function(obj) {
			return twic.utils.date.getTimestamp(new Date(obj['created_at']));
		},
		'is_protected': function(obj) {
			return (obj['protected']) ? 1 : 0;
		}
	};
};

goog.inherits(twic.db.obj.User, twic.DBObject);

/**
 * Overriden save method to update the dt field (user info last update time)
 * @param {function()=} callback Callback function
 * @override
 */
twic.db.obj.User.prototype.save = function(callback) {
	this.fields['dt'] = twic.utils.date.getCurrentTimestamp();

	twic.DBObject.prototype.save.call(this, callback);
};
