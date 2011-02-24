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

	twic.requests.subscribe('accountAdd', function(data, sendResponse) {
		sendResponse({});
		
		twic.api.getRequestToken( function(token, secret) {
			twic.api.tryGrantAccess(token);
		} );
	} );

	twic.requests.subscribe('accountList', function(data, sendResponse) {
		var accs = [];

		for (var i = 0; i < self.length; ++i) {
			accs.push(self[i]);
		}

		sendResponse(accs);
	} );

	twic.requests.subscribe('accountAuth', function(data, sendResponse) {
		// fixme send the result back
		sendResponse({ });
		
		if (!('pin' in data)) {
			return;
		}
		
		twic.api.getAccessToken(data['pin'], function(data) {		

			var checkUser = function(id) {
				var user = new twic.db.obj.User();
				user.loadById(id, function() {
					// found? great
					self.update();
				}, function() {
					// not found. lets get it
					twic.api.userinfo(id, function(info) {
						user.loadFromJSON(info);
						user.save( function() {
							self.update();
						} );
					} );
				} );
			};
		
			var updateAccount = function(account) {
				account.setValue('oauth_token', data['oauth_token']);
				account.setValue('oauth_token_secret', data['oauth_token_secret']);
				account.save();
			
				checkUser(account.fields['id']);
			}
	
			var account = new twic.db.obj.Account();
			account.loadById(data['user_id'], function() {
				// found? great, let's modify oauth data
				updateAccount(account);
			}, function() {
				account.setValue('id', data['user_id']);
				updateAccount(account);
			} );
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
			'select a.id, a.oauth_token, a.oauth_token_secret, u.screen_name, u.avatar ' +
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
