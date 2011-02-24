/**
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */
 
twic.db = ( function() {

	var migrations = {
		'0': {
			version: '0.01',
			callback: function(t) {
				// users info
				t.executeSql('create table users (' + 
					'id int not null primary key, ' +
					'name text not null, ' +
					'screen_name text not null, ' +
					'avatar text not null, ' + 
					'url text not null, ' + 
					'verified int not null, ' +
					'dt int not null)');
					
				// twic accounts
				t.executeSql('create table accounts (' +
					'id int not null primary key, ' +
					'oauth_token text not null, ' +
					'oauth_token_secret text not null)');

				// tweets storage
				t.executeSql('create table tweets (' +
					'id int not null primary key, ' +
					'user_id int not null, ' +
					'reply_to int null, ' +
					'dt int not null, ' +
					'msg text not null)');

				// timeline table for each account
				t.executeSql('create table timeline (' +
					'user_id int not null, ' +
					'tweet_id int not null)');
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
		var version = (ver == '') ? '0' : ver;

		if (version in migrations) {
			var migration = migrations[version];

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
		 * Transaction
		 * @param {function(SQLTransactionCallback)} callback Callback function
		 */
		transaction: function(callback) {
			getDatabase().transaction(callback);
		},
		/**
		 * Read-only transaction
		 * @param {function(SQLTransactionCallback)} callback Callback function
		 */
		readTransaction: function(callback) {
			getDatabase().readTransaction(callback);
		},
		
		obj: {}
	};

} )();
