/**
 * Object to work with database
 *
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

twic.db = ( function() {

	/**
	 * Error logger
	 * @param {SQLError} error SQL error
	 * @param {string} sqlText SQL query text
	 * @param {Array} sqlParams SQL query params
	 */
	var logError = function(error, sqlText, sqlParams) {
		twic.debug.groupCollapsed(sqlText, (sqlParams.length > 0) ? sqlParams : '');
		twic.debug.error('sql error: ' + error.message);
		twic.debug.groupEnd();
	};

	/**
	 * Execute the select statement
	 * @param {SQLTransaction} tr Read transaction
	 * @param {string} sqlText SQL query text
	 * @param {Array} sqlParams SQL query params
	 * @param {function()} successCallback Success callback
	 * @param {function(string)} failedCallback Failed callback
	 */
	var selectTransaction = function(tr, sqlText, sqlParams, successCallback, failedCallback) {
		tr.executeSql(
			sqlText, sqlParams,
			function(tr, res) {
				twic.debug.info(sqlText, (sqlParams.length > 0) ? sqlParams : '');

				if (successCallback) {
					successCallback.apply(res.rows);
				}
			},
			function(tr, error) {
				logError(error, sqlText, sqlParams);

				if (failedCallback) {
					failedCallback(error.message);
				}
			}
		);
	};

	/**
	 * Execute the select statement
	 * @param {Database} db Read transaction
	 * @param {string} sqlText SQL query text
	 * @param {Array} sqlParams SQL query params
	 * @param {function()} successCallback Success callback
	 * @param {function(string)} failedCallback Failed callback
	 */
	var select = function(db, sqlText, sqlParams, successCallback, failedCallback) {
		db.readTransaction( function(tr) {
			selectTransaction(tr, sqlText, sqlParams, successCallback, failedCallback);
		}, function(error) {
			logError(error, sqlText, sqlParams);

			if (failedCallback) {
				failedCallback(error.message);
			}
		} );
	};

	/**
	 * Execute the statement
	 * @param {SQLTransaction} tr ReadWrite transaction
	 * @param {string} sqlText SQL query text
	 * @param {Array} sqlParams SQL query params
	 * @param {function()} successCallback Success callback
	 * @param {function(string)} failedCallback Failed callback
	 */
	var executeTransaction = function(tr, sqlText, sqlParams, successCallback, failedCallback) {
		tr.executeSql(
			sqlText, sqlParams,
			function(tr, res) {
				twic.debug.info(sqlText, (sqlParams.length > 0) ? sqlParams : '');

				if (successCallback) {
					successCallback();
				}
			},
			function(tr, error) {
				logError(error, sqlText, sqlParams);

				if (failedCallback) {
					failedCallback(error.message);
				}
			}
		);
	};

	/**
	 * Execute the statement
	 * @param {Database} db Database
	 * @param {string} sqlText SQL query text
	 * @param {Array} sqlParams SQL query params
	 * @param {function()} successCallback Success callback
	 * @param {function(string)} failedCallback Failed callback
	 */
	var execute = function(db, sqlText, sqlParams, successCallback, failedCallback) {
		db.transaction( function(tr) {
			executeTransaction(tr, sqlText, sqlParams, successCallback, failedCallback);
		}, function(error) {
			logError(error, sqlText, sqlParams);

			if (failedCallback) {
				failedCallback(error.message);
			}
		} );
	};

	/**
	 * Execute the group of statements in one transaction
	 * @param {Database} db Database
	 * @param {Array} sqlObjArray SQL query text
	 * @param {function()} successCallback Success callback
	 * @param {function(string)} failedCallback Failed callback
	 */
	var executeGroup = function(db, sqlObjArray, successCallback, failedCallback) {
		db.transaction( function(tr) {
			twic.utils.queueIterator(sqlObjArray, function(obj, callback) {
				executeTransaction(tr, obj.sql, obj.params, callback, failedCallback);
			}, successCallback);
		}, function(error) {
			twic.debug.error('sql error: ' + error.message);

			if (failedCallback) {
				failedCallback(error.message);
			}
		} );
	};

	// todo rewrite to use executeGroup
	var migrations = {
		'0': {
			version: '0.01',
			runme: function(tr, callback) {
				twic.utils.queueIterator( [
					/**
					 * users info
					 */
					'create table users (' +
						'id int not null primary key, ' +
						'name varchar(128) not null, ' +
						'screen_name varchar(32) not null, ' +
						'avatar text not null, ' +
						'url text null, ' +
						'verified int not null, ' +
						'followers_count int not null, ' +
						'friends_count int not null, ' +
						'statuses_count int not null, ' +
						'regdate int not null, ' +
						'dt int not null' +
					')',

					/**
					 * twic accounts
					 */
					'create table accounts (' +
						'id int not null primary key, ' +
						'oauth_token text not null, ' +
						'oauth_token_secret text not null, ' +
						'unread_tweets_count int not null default 0, ' +
						'unread_messages_count int not null default 0' +
					')',

					/**
					 * tweets storage
					 */
					'create table tweets (' +
						// id is varchar cause of something wrong in javascript
						// parseInt(49765561487458304) => 49765561487458300
						'id varchar(32) primary key, ' +
						'user_id int not null, ' +
						// original author of retweet
						'retweeted_user_id int null, ' +
						'reply_to varchar(32) null, ' +
						'dt int not null, ' +
						// can be entity encoded
						'msg text not null' +
					')',

					/**
					 * timeline table for each account
					 */
					'create table timeline (' +
						'user_id int not null, ' +
						'tweet_id varchar(32) not null, ' +
						'primary key (user_id asc, tweet_id desc)' +
					')',

					/**
					 * Indexes
					 */
					'create index idx_users_name on users (screen_name)',
					'create index idx_tweets on tweets (dt desc, id desc)'
				], function(sqlText, callback) {
					executeTransaction(tr, sqlText, [], callback, callback);
				}, callback);
			}
		},
		'0.01': {
			version: '0.3',
			runme: function(tr, callback) {
				twic.utils.queueIterator( [
					/**
					 * friends info cache
					 */
					'create table friends (' +
						'source_user_id int not null, ' +
						'target_user_id int not null, ' +
						'following int not null, ' +
						'followed int not null, ' +
						'dt int not null, ' +
						'primary key (source_user_id, target_user_id)' +
					')'
				], function(sqlText, callback) {
					executeTransaction(tr, sqlText, [], callback, callback);
				}, callback);
			}
		},
		'0.3': {
			version: '0.4',
			runme: function(tr, callback) {
				twic.utils.queueIterator( [
					'alter table users add description varchar(255) not null default \'\'',
					'alter table users add location varchar(255) not null default \'\''
				], function(sqlText, callback) {
					executeTransaction(tr, sqlText, [], callback, callback);
				}, callback);
			}
		},
		'0.4': {
			version: '0.5',
			runme: function(tr, callback) {
				twic.utils.queueIterator( [
					'alter table users add screen_name_lower varchar(32) not null default \'\'',
					'update users set screen_name_lower = screen_name',
					'drop index idx_users_name',
					'create index idx_users_name on users (screen_name_lower)'
				], function(sqlText, callback) {
					executeTransaction(tr, sqlText, [], callback, callback);
				}, callback);
			}
		}
	};

	/**
	 * Migration procedure
	 * @param {Database} db Database
	 * @param {string} ver Source database version
	 * @param {function()} callback Callback function
	 */
	var migrate = function(db, ver, callback) {
		var version = (ver === '') ? '0' : ver;

		if (migrations[version]) {
			var migration = migrations[version];

			db.changeVersion(ver, migration.version, function(tr) {
				twic.debug.groupCollapsed('Database migration to the version ' + migration.version);

				migration.runme(tr, function() {
					twic.debug.groupEnd();

					migrate(db, migration.version, callback);
				} );
			}, function() {
				// fixme holy shit, we need to warn the user and ask him to drop the database
				twic.debug.error('Can\'t migrate :(');
			}, null );
		} else {
			callback();
		}
	};

	/**
	 * Cleanup the database
	 * @param {Database} db Database
	 * @param {function()} callback Callback
	 */
	var cleanup = function(db, callback) {
		var
			/** @const **/ cleanupMarkItem = 'lastCleanup',
			dirtyDate  = (new Date()).toJSON().split('T')[0],
			storedDate = window.localStorage.getItem(cleanupMarkItem);

		if (storedDate === dirtyDate) {
			callback();
			// running cleanup only once per day
			return;
		}

		window.localStorage.setItem(cleanupMarkItem, dirtyDate);

		var
			// week is enough for data to store
			cutDate = twic.utils.date.getCurrentTimestamp() - 60 * 60 * 24 * 7;

		twic.debug.groupCollapsed('Cleanup');

		twic.db.execQueries( [
			{ sql: 'delete from timeline where tweet_id in (select id from tweets where dt < ?)', params: [cutDate] },
			{ sql: 'delete from tweets where dt < ?', params: [cutDate] },
			{ sql: 'delete from users where dt < ? and id not in (select id from accounts)', params: [cutDate] },
			{ sql: 'delete from friends where dt < ?', params: [cutDate] }
		], function() {
			twic.debug.groupEnd();
			callback();
		} );
	};

	/** @type {Database} **/ var database = null;

	/**
	 * @param {function(Database)} callback Callback with database
	 */
	var getDatabase = function(callback) {
		if (!database) {
			database = openDatabase(twic.name, '', twic.name, 0);

			migrate(database, database.version, function() {
				cleanup(database, function() {
					callback(database);
				} );
			} );
		} else {
			callback(database);
		}
	};

	return {
		/**
		 * Execute the select statement
		 * @param {string} sqlText SQL query text
		 * @param {Array} sqlParams SQL query params
		 * @param {function()} successCallback Success callback
		 * @param {function(string)} failedCallback Failed callback
		 */
		openQuery: function(sqlText, sqlParams, successCallback, failedCallback) {
			getDatabase( function(db) {
				select(db, sqlText, sqlParams, successCallback, failedCallback);
			} );
		},

		/**
		 * Execute the statement
		 * @param {string} sqlText SQL query text
		 * @param {Array} sqlParams SQL query params
		 * @param {function()} successCallback Success callback
		 * @param {function(string)} failedCallback Failed callback
		 */
		execQuery: function(sqlText, sqlParams, successCallback, failedCallback) {
			getDatabase( function(db) {
				execute(db, sqlText, sqlParams, successCallback, failedCallback);
			} );
		},

		/**
		 * Execute the group of queries in one transaction
		 * @param {Array} sqlObjArray Array of sql objects
		 * @param {function()} successCallback Success callback
		 * @param {function(string)} failedCallback Failed callback
		 */
		execQueries: function(sqlObjArray, successCallback, failedCallback) {
			getDatabase( function(db) {
				executeGroup(db, sqlObjArray, successCallback, failedCallback);
			} );
		},

		// DBObject storage
		obj: {}
	};

}() );
