/**
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */
twic.db = ( function(t) {

	var migrations = {
		'0': {
			version: '0.01',
			callback: function(t) {
				t.executeSql('create table users (' + 
					'id int not null primary key, ' +
					'name text not null, ' +
					'screen_name text not null, ' +
					'avatar text not null, ' + 
					'url text not null, ' + 
					'verified int not null, ' +
					'dt int not null) ');
					
				t.executeSql('create table accounts (' +
					'id int not null primary key, ' +
					'oauth_token text not null, ' +
					'oauth_token_secret text not null)');
			}
		}
	};

	/**
	 * Migration procedure
	 * @param {Database} db Database
	 * @param {string} ver Source database version
	 */
	var migrate = function(db, ver) {
		var version = (ver == '') ? '0' : ver;

		if (version in migrations) {
			var migration = migrations[version];

			db.changeVersion(ver, migration.version, function(t) {
				migration.callback(t);
			}, function() {
				migrate(db, migration.version);							
			} );
		}
	};
	
	var database = null;
	
	var getDatabase = function() {
		if (!database) {
			database = openDatabase(t.name, '', t.name, null);
			migrate(database, database.version);
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

} )(twic);
