twic.Accounts = function() {

	this.length = 0;

	twic.notifier.subscribe('addAccount', function(request, sendResponse) {
		sendResponse({});

		chrome.tabs.create( {
			'url': 'http://api.twitter.com/oauth/authorize?oauth_token=' + twic.oauth.getToken()	
		} );
	} );
	
	twic.notifier.subscribe('accountAuthenticated', function(request, sendResponse) {
		sendResponse({ });
	
		var user = new twic.db.obj.User();
		user.loadByFieldValue('screen_name', request['data']['nick'], function() {
			console.dir(this);
		} );
	
/*
		twic.db.transaction( function(tr) {
			tr.executeSql('insert into accounts (id, pin) select ?, ?', [
				request['data']['id'],
				request['data']['pin']
			] );
		} );
		
		twic.twitter.getUserInfo(request['data']['nick'], function(data) {
		
		} );
*/
	} );

	this.update();
};

twic.Accounts.prototype.clear = function() {
	while (this.length > 0) {
		delete this[this.length--];
	}
};

twic.Accounts.prototype.update = function() {
	var accounts = this;

	accounts.clear();
	
	twic.db.readTransaction( function(tr) {
		tr.executeSql('select id, nick, pin from accounts', [], function(tr, res) {
			for (var i = 0; i < res.rows.length; ++i) {
				var account = new twic.Account();
				account.fromRow(res.rows.item(i));
				
				accounts[accounts.length++] = account;
			}
		} );
	} );
};
