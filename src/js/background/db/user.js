twic.db.obj.User = function() {
	this.table = 'users';
	this.fields = ['id', 'name', 'screen_name', 'avatar', 'url', 'verified', 'dt'];
}

twic.db.obj.User.prototype = twic.dbobject;
