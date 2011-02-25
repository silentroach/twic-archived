/**
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

/**
 * @constructor
 */
twic.db.obj.User = function() {
	twic.db.obj.User.superclass.constructor.call(this);

	this.table = 'users';
	this.fields = {
		'id': 0,
		'name': '',
		'screen_name': '',
		'avatar': '',
		'url': '',
		'verified': '',
		'dt': twic.utils.getCurrentTimestamp()
	};

	this.jsonMap = {
		'avatar': 'profile_image_url',
		'verified': function(obj) {
			return ('verified' in obj && obj['verified']) ? 1 : 0;
		}
	};
}

twic.utils.extend(twic.db.obj.User, twic.DBObject);

twic.db.obj.User.prototype.save = function(callback) {
	// update for 'dt' each save method call
	this.fields['dt'] = twic.utils.getCurrentTimestamp();

	twic.db.obj.User.superclass.save.call(this, callback);
}
