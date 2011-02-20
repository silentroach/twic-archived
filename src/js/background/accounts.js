/**
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

/**
 * @constructor
 */
twic.Accounts = function() {

	var self = this;

	self.length = 0;

	twic.notifier.subscribe('accountAdd', function(request, sendResponse) {
		sendResponse({});
		
		twic.oauth.getRequestToken( function(t, ts) {
			chrome.tabs.create( {
				'url': 'https://api.twitter.com/oauth/authorize?oauth_token=' + t
			} );
		} );
	} );

	twic.notifier.subscribe('accountList', function(request, sendResponse) {
		var accs = [];

		for (var i = 0; i < self.length; ++i) {
			accs.push(self[i]);
		}

		sendResponse(accs);
	} );
	
	twic.notifier.subscribe('accountAuth', function(request, sendResponse) {
		sendResponse({ });
		
		var afterAll = function() {
  		self.update();
  		
  		// get the access_token
		};
		
		var checkUser = function() {
			var user = new twic.db.obj.User();
			user.loadById(request['data']['id'], function() {
				// found? great
				afterAll();
			}, function() {
				// not found. lets get it
				twic.api.userinfo(request['data']['id'], function(info) {
					user.loadFromJSON(info);
					user.save();
					
					afterAll();
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
			  'inner join users u on ( ' +
			    'u.id = a.id ' +
			  ') ' + 
			'order by u.screen_name ', [], function(tr, res) {
			for (var i = 0; i < res.rows.length; ++i) {
				accounts[accounts.length++] = res.rows.item(i);
			}
		} );
	} );
};

twic.Accounts.prototype.isItMe = function(id) {
	var accounts = this;
	
	for (var i = 0; i < accounts.length; ++i) {
		if (accounts[i]['id'] == id) {
			return true;
		}
	}
	
	return false;
}
