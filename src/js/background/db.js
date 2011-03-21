/**
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

/**
 * Object to work with database
 */
twic.db = ( function() {

	var migrations = {
		'0': {
			version: '0.01',
			callback: function(t) {
				// todo check the field sizes
				// todo will it run parallel or query after query?

				// users info
				t.executeSql('create table users (' +
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
					'dt int not null)');

				// twic accounts
				t.executeSql('create table accounts (' +
					'id int not null primary key, ' +
					'oauth_token text not null, ' +
					'oauth_token_secret text not null, ' +
					'unread_tweets_count int not null default 0, ' +
					'unread_messages_count int not null default 0)');

				// tweets storage
				t.executeSql('create table tweets (' +
					// id is varchar cause of something wrong in javascript
					// parseInt(49765561487458304) => 49765561487458300
					'id varchar(32) primary key, ' +
					'user_id int not null, ' +
					// original author of retweet
					'retweeted_user_id int null, ' +
					'reply_to varchar(32) null, ' +
					'dt int not null, ' +
					'msg text not null)'); // can be entity encoded

				// timeline table for each account
				t.executeSql('create table timeline (' +
					'user_id int not null, ' +
					'tweet_id varchar(32) not null, ' +
					'primary key (user_id asc, tweet_id desc))');

				t.executeSql('create index idx_tweets_user on tweets (user_id)');
				t.executeSql('create index idx_users_name on users (screen_name)');
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

			// todo think about migration in more than one version, run it each after
			db.changeVersion(ver, migration.version, function(t) {
				migration.callback(t);
			}, function() {
				migrate(db, migration.version);
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
		// todo ???
	};

	var database = null;

	var getDatabase = function() {
		if (!database) {
			database = openDatabase(twic.name, '', twic.name, null);
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
			getDatabase().readTransaction( function(tr) {
				tr.executeSql(
					sqlText, sqlParams,
					function(tr, res) {
						twic.debug.info(sqlText, sqlParams);

						if (successCallback) {
							successCallback.apply(res.rows);
						}
					},
					function(tr, error) {
						twic.debug.groupCollapsed(sqlText, sqlParams);
						twic.debug.error('sql error: ' + error.message);
						twic.debug.groupEnd();

						if (failedCallback) {
							failedCallback(error.message);
						}
					}
				);
			}, function(error) {
				twic.debug.groupCollapsed(sqlText, sqlParams);
				twic.debug.error('sql error: ' + error.message);
				twic.debug.groupEnd();

				if (failedCallback) {
					failedCallback(error.message);
				}
			} );
		},

		/**
		 * Execute the statement
		 * @param {!string} sqlText SQL query text
		 * @param {Array} sqlParams SQL query params
		 * @param {function()} successCallback Success callback
		 * @param {function(string)} failedCallback Failed callback
		 */
		execute: function(sqlText, sqlParams, successCallback, failedCallback) {
			getDatabase().transaction( function(tr) {
				tr.executeSql(
					sqlText, sqlParams,
					function(tr, res) {
						twic.debug.info(sqlText, sqlParams);

						if (successCallback) {
							successCallback();
						}
					},
					function(tr, error) {
						twic.debug.groupCollapsed(sqlText, sqlParams);
						twic.debug.error('sql error: ' + error.message);
						twic.debug.groupEnd();

						if (failedCallback) {
							failedCallback(error.message);
						}
					}
				);
			}, function(error) {
				twic.debug.groupCollapsed(sqlText, sqlParams);
				twic.debug.error('sql error: ' + error.message);
				twic.debug.groupEnd();

				if (failedCallback) {
					failedCallback(error.message);
				}
			} );
		},

		// DBObject storage
		obj: {}
	};

}() );
