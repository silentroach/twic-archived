twic.Accounts = function() {

	this.length = 0;

	twic.notifier.subscribe('addAccount', function(request, sendResponse) {
		sendResponse({});

		chrome.tabs.create( {
			'url': 'http://api.twitter.com/oauth/authorize?oauth_token=' + twic.oauth.getToken()	
		} );
	} );

	twic.notifier.subscribe('getAccountList', function(request, sendResponse) {
		var accs = [];

		for (var i = 0; i < this.length; ++i) {
			accs.push(this[i]);
		}

		console.dir(accs);
		sendResponse(accs);
	} );
	
	twic.notifier.subscribe('accountAuthenticated', function(request, sendResponse) {
		sendResponse({ });
		
		var checkUser = function() {
			var user = new twic.db.obj.User();
			user.loadById(request['data']['id'], function() {
				// found? great
			}, function() {
				// not found. lets get it
				twic.api.userinfo(request['data']['id'], function(info) {
					user.loadFromJSON(info);
					user.save();
				} );
			} );
		};
		
		var updateAccount = function(account, pin) {
			account.setValue('pin', request['data']['pin']);
			account.save();
			
			checkUser(account.fields['id']);
		}
	
		var account = new twic.db.obj.Account();
		account.loadById(request['data']['id'], function() {
			// found? great, let's modify the pid
			updateAccount(account, request['data']['pin']);
		}, function() {
			account.setValue('id', request['data']['id']);
			updateAccount(account, request['data']['pin']);
		} );
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
		tr.executeSql(
			'select a.id, a.pin, u.screen_name, u.avatar ' +
			'from accounts a ' +
			'  inner join users u on ( ' +
			'    u.id = a.id ' +
			'  ) ', [], function(tr, res) {
			for (var i = 0; i < res.rows.length; ++i) {
				accounts[accounts.length++] = res.rows.item(i);
			}
		} );
	} );
};
