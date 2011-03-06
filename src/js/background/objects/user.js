/**
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

/**
 * @constructor
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
		'dt': twic.utils.date.getCurrentTimestamp()
	};

	this.jsonMap = {
		'avatar': 'profile_image_url',
		'verified': function(obj) {
			return (obj['verified']) ? 1 : 0;
		}
	};
};

goog.inherits(twic.db.obj.User, twic.DBObject);

twic.db.obj.User.prototype.save = function(callback) {
	// update for 'dt' each save method call
	this.fields['dt'] = twic.utils.date.getCurrentTimestamp();

	twic.DBObject.prototype.save.call(this, callback);
};
