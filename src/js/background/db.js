/**
 * Object to work with database
 *
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

twic.db = ( function() {

	// todo refactor me to utils module
	var queueIterator = function(arr, iterator, callback) {
		if (!arr.length) {
			return callback();
		}

		var completed = 0;

		var iterate = function () {
			iterator(arr[completed], function (err) {
				if (err) {
					callback(err);
					callback = function () {};
				} else {
					++completed;

					if (completed === arr.length) {
						callback();
					} else {
						iterate();
					}
				}
			} );
		};

		iterate();
	};

	/**
	 * Error logger
	 * @param {SQLError} error SQL error
	 * @param {!string} sqlText SQL query text
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
	 * @param {!string} sqlText SQL query text
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
	 * @param {!string} sqlText SQL query text
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
	 * @param {!string} sqlText SQL query text
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
	 * @param {!string} sqlText SQL query text
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

	var migrations = {
		'0': {
			version: '0.01',
			runme: function(tr, callback) {
				// todo check the field sizes

				queueIterator( [
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
					'create index idx_tweets_user on tweets (user_id)',
					'create index idx_users_name on users (screen_name)'
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
				twic.debug.error('Can\'t migrate :(');
			} );
		} else {
			callback();
		}
	};

	/**
	 * Cleanup the database
	 * @param {Database} db Database
	 */
	var cleanup = function(db) {
//		twic.debug.groupCollapsed('Cleanup');
		// todo ???
	};

	var database = null;

	var getDatabase = function() {
		if (!database) {
			database = openDatabase(twic.name, '', twic.name, 0);
			migrate(database, database.version, function() {
				cleanup(database);
			} );
		}

		return database;
	};

	return {
		/**
		 * Execute the select statement
		 * @param {!string} sqlText SQL query text
		 * @param {Array} sqlParams SQL query params
		 * @param {function()} successCallback Success callback
		 * @param {function(string)} failedCallback Failed callback
		 */
		select: function(sqlText, sqlParams, successCallback, failedCallback) {
			select(getDatabase(), sqlText, sqlParams, successCallback, failedCallback);
		},

		/**
		 * Execute the statement
		 * @param {!string} sqlText SQL query text
		 * @param {Array} sqlParams SQL query params
		 * @param {function()} successCallback Success callback
		 * @param {function(string)} failedCallback Failed callback
		 */
		execute: function(sqlText, sqlParams, successCallback, failedCallback) {
			execute(getDatabase(), sqlText, sqlParams, successCallback, failedCallback);
		},

		// DBObject storage
		obj: {}
	};

}() );

