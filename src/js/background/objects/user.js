/**
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

/**
 * @constructor
 */
twic.db.obj.User = function() {
	this.table = 'users';
	this.fields = {
		'id': 0, 
		'name': '', 
		'screen_name': '', 
		'avatar': '', 
		'url': '', 
		'verified': '', 
		'dt': Math.floor((new Date()).getTime() / 1000)
	};
	
	this.jsonMap = {
		'avatar': 'profile_image_url',
		'verified': function(obj) {
			return ('verified' in obj && obj['verified']) ? 1 : 0;
		}
	};
}

twic.db.obj.User.prototype = new twic.dbobject();
