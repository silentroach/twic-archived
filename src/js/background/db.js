/**
 * Object to work with database
 *
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

twic.db = { };

/**
 * Database name
 * @const
 * @type {string}
 */
twic.db.NAME = 'Twic';

// DBObject storage
twic.db.obj = { };

/**
 * Error logger
 * @private
 * @param {SQLError} error SQL error
 * @param {string} sqlText SQL query text
 * @param {Array} sqlParams SQL query params
 */
twic.db.logError_ = function(error, sqlText, sqlParams) {
	twic.debug.groupCollapsed(sqlText, (sqlParams.length > 0) ? sqlParams : '');
	twic.debug.error('sql error: ' + error.message);
	twic.debug.groupEnd();
};

/**
 * Execute the select statement
 * @private
 * @param {SQLTransaction} tr Read transaction
 * @param {string} sqlText SQL query text
 * @param {Array} sqlParams SQL query params
 * @param {function(SQLResultSetRowList)} successCallback Success callback
 * @param {function(string)=} failedCallback Failed callback
 */
twic.db.selectTransaction_ = function(tr, sqlText, sqlParams, successCallback, failedCallback) {
	tr.executeSql(
		sqlText, sqlParams,
		function(tr, res) {
			twic.debug.info(sqlText, (sqlParams.length > 0) ? sqlParams : '');

			if (successCallback) {
				successCallback(res.rows);
			}
		},
		function(tr, error) {
			twic.db.logError_(error, sqlText, sqlParams);

			if (failedCallback) {
				failedCallback(error.message);
			}
		}
	);
};

/**
 * Execute the select statement
 * @private
 * @param {Database} db Read transaction
 * @param {string} sqlText SQL query text
 * @param {Array} sqlParams SQL query params
 * @param {function(SQLResultSetRowList)} successCallback Success callback
 * @param {function(string)=} failedCallback Failed callback
 */
twic.db.select_ = function(db, sqlText, sqlParams, successCallback, failedCallback) {
	db.readTransaction( function(tr) {
		twic.db.selectTransaction_(tr, sqlText, sqlParams, successCallback, failedCallback);
	}, function(error) {
		twic.db.logError_(error, sqlText, sqlParams);

		if (failedCallback) {
			failedCallback(error.message);
		}
	} );
};

/**
 * Execute the statement
 * @private
 * @param {SQLTransaction} tr ReadWrite transaction
 * @param {string} sqlText SQL query text
 * @param {Array} sqlParams SQL query params
 * @param {function()=} successCallback Success callback
 * @param {function(string)=} failedCallback Failed callback
 */
twic.db.executeTransaction_ = function(tr, sqlText, sqlParams, successCallback, failedCallback) {
	tr.executeSql(
		sqlText, sqlParams,
		function(tr, res) {
			twic.debug.info(sqlText, (sqlParams.length > 0) ? sqlParams : '');

			if (successCallback) {
				successCallback();
			}
		},
		function(tr, error) {
			twic.db.logError_(error, sqlText, sqlParams);

			if (failedCallback) {
				failedCallback(error.message);
			}
		}
	);
};

/**
 * Execute the statement
 * @private
 * @param {Database} db Database
 * @param {string} sqlText SQL query text
 * @param {Array} sqlParams SQL query params
 * @param {function()=} successCallback Success callback
 * @param {function(string)=} failedCallback Failed callback
 */
twic.db.execute_ = function(db, sqlText, sqlParams, successCallback, failedCallback) {
	db.transaction( function(tr) {
		twic.db.executeTransaction_(tr, sqlText, sqlParams, successCallback, failedCallback);
	}, function(error) {
		twic.db.logError_(error, sqlText, sqlParams);

		if (failedCallback) {
			failedCallback(error.message);
		}
	} );
};

/**
 * Execute the group of statements in one transaction
 * @private
 * @param {Database} db Database
 * @param {Array} sqlObjArray SQL query text
 * @param {function()} successCallback Success callback
 * @param {function(string)=} failedCallback Failed callback
 */
twic.db.executeGroup_ = function(db, sqlObjArray, successCallback, failedCallback) {
	db.transaction( function(tr) {
		twic.utils.queueIterator(sqlObjArray, function(obj, callback) {
			twic.db.executeTransaction_(tr, obj.sql, obj.params, callback, failedCallback);
		}, successCallback);
	}, function(error) {
		twic.debug.error('sql error: ' + error.message);

		if (failedCallback) {
			failedCallback(error.message);
		}
	} );
};

/**
 * todo rewrite to use executeGroup
 * @private
 */
twic.db.migrations_ = {
	'0': {
		ver: '0.4',
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
					'description varchar(255) not null default \'\', ' +
					'location varchar(255) not null default \'\', ' +
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
				 * friends info cache
				 */
				'create table friends (' +
					'source_user_id int not null, ' +
					'target_user_id int not null, ' +
					'following int not null, ' +
					'followed int not null, ' +
					'dt int not null, ' +
					'primary key (source_user_id, target_user_id)' +
				')',

				/**
				 * Indexes
				 */
				'create index idx_users_name on users (screen_name)',
				'create index idx_tweets on tweets (dt desc, id desc)'
			], function(sqlText, callback) {
				twic.db.executeTransaction_(tr, sqlText, [], callback, callback);
			}, callback);
		}
	},
	'0.4': {
		ver: '0.5',
		runme: function(tr, callback) {
			twic.utils.queueIterator( [
				'alter table users add screen_name_lower varchar(32) not null default \'\'',
				'update users set screen_name_lower = screen_name',
				'drop index idx_users_name',
				'create index idx_users_name on users (screen_name_lower)'
			], function(sqlText, callback) {
				twic.db.executeTransaction_(tr, sqlText, [], callback, callback);
			}, callback);
		}
	},
	'0.5': {
		ver: '0.6',
		runme: function(tr, callback) {
			twic.utils.queueIterator( [
				'create table options (' +
					'key varchar(32) not null, ' +
					'val varchar(32) not null, ' +
					'primary key (key)' +
				')'
			], function(sqlText, callback) {
				twic.db.executeTransaction_(tr, sqlText, [], callback, callback);
			}, callback);
		}
	},
	'0.6': {
		ver: '0.7',
		runme: function(tr, callback) {
			twic.utils.queueIterator( [
				'alter table tweets add source text not null default \'\'',
				'alter table users add is_protected int not null default 0'
			], function(sqlText, callback) {
				twic.db.executeTransaction_(tr, sqlText, [], callback, callback);
			}, callback);
		}
	},
	'0.7': {
		ver: '0.8',
		runme: function(tr, callback) {
			twic.utils.queueIterator( [
				// kill this shit
				'drop table friends',
				/**
				 * friends info cache
				 */
				'create table friends (' +
					'id text not null, ' +         // (str)minID_(str)maxID
					'following text not null, ' +  // 1_0
					'dt int not null, ' +
					'primary key (id)' +
				')'
			], function(sqlText, callback) {
				twic.db.executeTransaction_(tr, sqlText, [], callback, callback);
			}, callback);
		}
	},
	'0.8': {
		ver: '0.9',
		runme: function(tr, callback) {
			twic.utils.queueIterator( [
				// tweet links
				'create table links (' +
					'tweet_id varchar(32) not null, ' +
					'lnk text not null, ' +
					'expanded text not null ' +
				')',
				// indexes for tweet links
				'create index idx_links_tweet on links (tweet_id)'
			], function(sqlText, callback) {
				twic.db.executeTransaction_(tr, sqlText, [], callback, callback);
			}, callback);
		}
	},
	'0.9': {
		ver: '0.10',
		runme: function(tr, callback) {
			twic.utils.queueIterator( [
				'alter table tweets add geo text null'
			], function(sqlText, callback) {
				twic.db.executeTransaction_(tr, sqlText, [], callback, callback);
			}, callback);
		}
	},
	'0.10': {
		ver: '0.11',
		runme: function(tr, callback) {
			twic.utils.queueIterator( [
				'alter table users add geo_enabled int not null default 0'
			], function(sqlText, callback) {
				twic.db.executeTransaction_(tr, sqlText, [], callback, callback);
			}, callback)
		}
	}
};

/**
 * Migration procedure
 * @private
 * @param {Database} db Database
 * @param {string} ver Source database version
 * @param {function()} callback Callback function
 */
twic.db.migrate_ = function(db, ver, callback) {
	var version = (ver === '') ? '0' : ver;

	if (twic.db.migrations_[version]) {
		var migration = twic.db.migrations_[version];

		db.changeVersion(ver, migration.ver, function(tr) {
			twic.debug.groupCollapsed('Database migration to the version ' + migration.ver);

			migration.runme(tr, function() {
				twic.debug.groupEnd();

				twic.db.migrate_(db, migration.ver, callback);
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
 */
twic.db.cleanup = function() {
	var
		// week is enough for data to store
		cutDate = twic.utils.date.getCurrentTimestamp() - 60 * 60 * 24 * 7;

	twic.debug.groupCollapsed('Cleanup');

	twic.db.execQueries( [
		{ sql: 'delete from timeline where tweet_id in (select id from tweets where dt < ?)', params: [cutDate] },
		{ sql: 'delete from links where tweet_id in (select id from tweets where dt < ?)', params: [cutDate] },
		{ sql: 'delete from tweets where dt < ?', params: [cutDate] },
		{ sql: 'delete from users where dt < ? and id not in (select id from accounts)', params: [cutDate] },
		{ sql: 'delete from friends where dt < ?', params: [cutDate] }
	], function() {
		twic.debug.groupEnd();
	} );
};

/**
 * @type {boolean}
 * @private
 */
twic.db.isPreparing_ = false;

/**
 * @type {Database}
 * @private
 */
twic.db.database_ = null;

/**
 * @private
 * @param {function(Database)} callback Callback with database
 */
twic.db.getDatabase_ = function(callback) {
	if (!twic.db.database_) {
		if (twic.db.isPreparing_) {
			// wait a little while migration ends
			setTimeout( function() {
				twic.db.getDatabase_(callback);
			}, 500 );
		} else {
			twic.db.isPreparing_ = true;

			var
				tmpDB = openDatabase(twic.db.NAME, '', twic.db.NAME, 0);

			twic.db.migrate_(tmpDB, tmpDB.version, function() {
				twic.db.isPreparing_ = false;
				twic.db.database_ = tmpDB;

				callback(twic.db.database_);
			} );
		}
	} else {
		callback(twic.db.database_);
	}
};

/**
 * Execute the select statement
 * @param {string} sqlText SQL query text
 * @param {Array} sqlParams SQL query params
 * @param {function(SQLResultSetRowList)} successCallback Success callback
 * @param {function(string)=} failedCallback Failed callback
 */
twic.db.openQuery = function(sqlText, sqlParams, successCallback, failedCallback) {
	twic.db.getDatabase_( function(db) {
		twic.db.select_(db, sqlText, sqlParams, successCallback, failedCallback);
	} );
};

/**
 * Execute the statement
 * @param {string} sqlText SQL query text
 * @param {Array} sqlParams SQL query params
 * @param {function()=} successCallback Success callback
 * @param {function(string)=} failedCallback Failed callback
 */
twic.db.execQuery = function(sqlText, sqlParams, successCallback, failedCallback) {
	twic.db.getDatabase_( function(db) {
		twic.db.execute_(db, sqlText, sqlParams, successCallback, failedCallback);
	} );
};

/**
 * Execute the group of queries in one transaction
 * @param {Array} sqlObjArray Array of sql objects
 * @param {function()} successCallback Success callback
 * @param {function(string)=} failedCallback Failed callback
 */
twic.db.execQueries = function(sqlObjArray, successCallback, failedCallback) {
	twic.db.getDatabase_( function(db) {
		twic.db.executeGroup_(db, sqlObjArray, successCallback, failedCallback);
	} );
};

