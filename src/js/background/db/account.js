twic.db.obj.Account = function() {
	this.table = 'accounts';
	this.fields = {
		'id': 0, 
		'pin': ''
	};
};

twic.db.obj.Account.prototype = new twic.dbobject();
