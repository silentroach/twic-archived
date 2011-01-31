twic.Account = function() { }

twic.Account.prototype.nick = '';
twic.Account.prototype.id = 0;
twic.Account.prototype.pin = '';

twic.Account.prototype.fromRow = function(row) {
	this.nick = row['nick'];
	this.id = row['id'];
	this.pin = row['pin'];
};
