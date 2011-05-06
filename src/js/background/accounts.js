/**
 * Accounts list
 *
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

twic.accounts = ( function() {

	var
		accounts = { },
		items = [];

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

		account = accounts.getInfo(id);

		if (!account) {
			fail();
		}

		twic.db.execQueries( [
			{ sql: 'delete from timeline where user_id = ?', params: [id] },
			{ sql: 'delete from tweets where user_id = ?', params: [id] },
			{ sql: 'delete from users where id = ?', params: [id] },
			{ sql: 'delete from accounts where id = ?', params: [id] }
		], function() {
			accounts.updateList( function() {
				sendResponse( {
					'result': twic.global.FAILED
				} );
			} );
		} );
	} );

	twic.requests.subscribe('accountAdd', function(data, sendResponse) {
		// popup is already closed so send it now
		sendResponse({});

		twic.api.accountAdd();
	} );

	twic.requests.subscribe('accountList', function(data, sendResponse) {
		var
			accs = [],
			id;

		for (id in items) {
			var item = items[id];

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
			|| !data['user_nick']
		) {
			sendResponse( {
				'res': twic.global.FAILED
			} );

			return;
		}

		var
			userNick = data['user_nick'],
			account = accounts.getInfoByNick(userNick);

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
				accounts.updateList( function() {
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

			twic.twitter.getUserInfo(userNick, function(obj) {
				account.setValue('id', obj.fields['id']);
				updateAccount(account);
			} );
		}, function(error) {
			sendResponse( {
				'res': twic.global.FAILED
			} );
		} );
	} );

	// -----------------------------------------

	/**
	 * Schedule to update user home timeline
	 */
	var scheduler = function() {
		var i;

		for (i in items) {
			twic.twitter.updateHomeTimeline(items[i].fields['id']);
		}
	};

	// ----------------------------------------

	/**
	 * Clear the accounts array
	 */
	var clear = function() {
		items = { };
	};

	/**
	 * Update the unread messages counter
	 */
	accounts.updateCounter = function() {
		var
			unreadTweetsCount = 0,
			badgeHint = [],
			id;

		for (id in items) {
			unreadTweetsCount += items[id].fields['unread_tweets_count'];
		}

		if (unreadTweetsCount > 0) {
			badgeHint.push(
				twic.utils.lang.translate('badge_unread_tweets_count', [unreadTweetsCount])
			);
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
	accounts.updateList = function(callback) {
		var
			tmpAccount = new twic.db.obj.Account(),
			tmpUser    = new twic.db.obj.User();

		clear();

		twic.db.openQuery(
			'select ' + tmpAccount.getFieldString('a') + ', ' + tmpUser.getFieldString('u') + ' ' +
			'from accounts a ' +
				'inner join users u on ( ' +
					'u.id = a.id ' +
				') ' +
			'order by u.screen_name_lower ', [],
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

					items[id] = tmp;
					items[id].onUnreadTweetsCountChanged = updateMyCounter;
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
	accounts.getInfo = function(id) {
		if (items[id]) {
			return items[id];
		}

		return false;
	};

	/**
	 * Get user info by nick
	 * @param {string} nick User nick
	 * @return {Object|boolean} Account or false
	 */
	accounts.getInfoByNick = function(nick) {
		var
			nickLowered = nick.toLowerCase(),
			id;

		for (id in items) {
			if (items[id].user.fields['screen_name_lower'] === nickLowered) {
				return items[id];
			}
		}

		return false;
	};

	// ------------------------------------------

	accounts.updateList( function() {
		// first check in 5 seconds
		setTimeout(function() {
			scheduler();

			// and then every minute check
			setInterval(scheduler, 60 * 1000);
		}, 5000);
	} );

	return accounts;

}() );
