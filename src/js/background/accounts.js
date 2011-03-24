/**
 * Accounts list
 *
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

// todo make it static object

/**
 * @constructor
 */
twic.Accounts = function() {

	var self = this;

	self.items = undefined;

	twic.requests.subscribe('accountRemove', function(data, sendResponse) {
		var
			id = data['id'] || -1,
			account;

		var fail = function() {
			sendResponse( {
				'result': twic.global.FAILED
			} );

			return;
		};

		if (id < 0) {
			fail();
		}

		account = self.getInfo(id);

		if (!account) {
			fail();
		}

		twic.utils.queueIterator( [
			'delete from timeline where user_id = ?',
			'delete from tweets where user_id = ?',
			'delete from users where id = ?',
			'delete from accounts where id = ?'
		],
		function(sqlText, callback) {
			twic.db.execute(sqlText, [id], callback, fail);
		}, function() {
			self.update();

			sendResponse( {
				'result': twic.global.FAILED
			} );
		} );
	} );

	twic.requests.subscribe('accountAdd', function(data, sendResponse) {
		// popup is already closed so send it now
		sendResponse({});

		twic.api.getRequestToken( function(token, secret) {
			twic.api.tryGrantAccess(token);
		} );
	} );

	twic.requests.subscribe('accountList', function(data, sendResponse) {
		var
			accs = [],
			id;

		for (id in self.items) {
			var item = self.items[id];

			accs.push( {
				'id': id,
				'avatar': item.user.fields['avatar'],
				'screen_name': item.user.fields['screen_name'],
				'unread_tweets': item.fields['unread_tweets_count']
			} );
		}

		sendResponse(accs);
	} );

	twic.requests.subscribe('accountAuth', function(data, sendResponse) {
		if (
			!data['pin']
			|| !data['user_id']
		) {
			sendResponse( {
				'res': twic.global.FAILED
			} );

			return;
		}

		var
			userid = data['user_id'],
			account = self.getInfo(userid);

		if (account) {
			sendResponse( {
				'res': twic.global.AUTH_ALREADY
			} );

			return;
		}

		twic.api.getAccessToken(data['pin'], function(data) {
			var
				account = new twic.db.obj.Account();

			var afterAll = function() {
				// reset the token after auth is complete
				twic.api.resetToken();

				// update the accounts information
				self.update( function() {
					// and update the home timeline for user
					twic.twitter.updateHomeTimeline(account.fields['id']);
				} );
			};

			var checkUser = function(id) {
				var user = new twic.db.obj.User();
				user.loadById(id, afterAll, function() {
					// not found. lets get it
					twic.api.getUserInfo(id, function(info) {
						user.loadFromJSON(info);
						user.save(afterAll);
					} );
				} );
			};

			var updateAccount = function(account) {
				account.setValue('oauth_token', data['oauth_token']);
				account.setValue('oauth_token_secret', data['oauth_token_secret']);
				account.save();

				sendResponse( {
					'res': twic.global.SUCCESS
				} );

				checkUser(account.fields['id']);
			};

			account.loadById(userid, function() {
				// found? great, let's modify oauth data
				updateAccount(account);
			}, function() {
				account.setValue('id', userid);
				updateAccount(account);
			} );
		}, function(error) {
			sendResponse( {
				'res': twic.global.FAILED
			} );
		} );
	} );

	/**
	 * Schedule to update user home timeline
	 */
	var scheduler = function() {
		var i;

		for (i in self.items) {
			var
				account = self.items[i];

			twic.twitter.updateHomeTimeline(account.fields['id']);
		}
	};

	// every minute check
	setInterval(scheduler, 60 * 1000);

	// first check in 5 seconds
	setTimeout(scheduler, 5000);
};

/**
 * Clear the accounts array
 */
twic.Accounts.prototype.clear = function() {
	this.items = { };
};

/**
 * Update the unread messages counter
 */
twic.Accounts.prototype.updateCounter = function() {
	var
		accounts = this,
		unreadTweetsCount = 0,
		badgeHint = [],
		id;

	for (id in accounts.items) {
		unreadTweetsCount += accounts.items[id].fields['unread_tweets_count'];
	}

	if (unreadTweetsCount > 0) {
		badgeHint.push(chrome.i18n.getMessage('badge_unread_tweets_count', [unreadTweetsCount]));
	}

	chrome.browserAction.setTitle( {
		'title': badgeHint.length > 0 ? badgeHint.join("\n") : twic.name
	} );

	chrome.browserAction.setBadgeText( {
		'text': unreadTweetsCount === 0 ? '' : (unreadTweetsCount < 10 ? unreadTweetsCount.toString() : '...')
	} );
};

/**
 * Update accounts info
 * @param {function()=} callback Callback function
 * todo think about more nice solution
 */
twic.Accounts.prototype.update = function(callback) {
	var
		accounts   = this,
		tmpAccount = new twic.db.obj.Account(),
		tmpUser    = new twic.db.obj.User();

	accounts.clear();

	twic.db.select(
		'select ' + tmpAccount.getFieldString('a') + ', ' + tmpUser.getFieldString('u') + ' ' +
		'from accounts a ' +
			'inner join users u on ( ' +
				'u.id = a.id ' +
			') ' +
		'order by u.screen_name ', [],
		/**
		 * @this {SQLResultSetRowList}
		 */
		function() {
			var
				rows = this,
				accs = new twic.DBObjectList(twic.db.obj.Account),
				usrs = new twic.DBObjectList(twic.db.obj.User),
				id;

			accs.load(rows, 'a');
			usrs.load(rows, 'u');

			var updateMyCounter = function() {
				accounts.updateCounter.apply(accounts);
			};

			for (id in accs.items) {
				var tmp = accs.items[id];
				tmp.user = usrs.items[id];

				accounts.items[id] = tmp;
				accounts.items[id].onUnreadTweetsCountChanged = updateMyCounter;
			}

			accounts.updateCounter();

			if (callback) {
				callback.apply(accounts);
			}
	} );
};

/**
 * Get user info
 * @param {number} id User id
 * @return {Object|boolean} Account or false
 */
twic.Accounts.prototype.getInfo = function(id) {
	if (this.items[id]) {
		return this.items[id];
	}

	return false;
};

