/**
 * Options storage
 *
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

twic.options = { };

/**
 * Options
 * @private
 */
twic.options.storage_ = {
	// twitter api config values
	'short_url_length': '19',
	'short_url_length_https': '20',
	// -------------------------
	// 48x48 avatar size
	'avatar_size': '48',
	// show geo info
	'tweet_show_geo': true,
	// show images previews
	'tweet_show_images': true,
	// show the tweet time
	'tweet_show_time': true,
	// show the tweet time as a link
	'tweet_show_time_link': false,
	// show the twitter client
	'tweet_show_client': false
};

/**
 * Hash for existand db keys
 * @private
 */
twic.options.inDB_ = { };

/**
 * Get the value
 * @param {string} key Options key
 */
twic.options.getValue = function(key) {
	if (key in twic.options.storage_) {
		return twic.options.storage_[key];
	}

	return false;
};

/**
 * Set the key value
 * @param {string} key Key
 * @param {*} value Value
 */
twic.options.setValue = function(key, value) {
	if (key in twic.options.storage_) {
		twic.db.execQuery(
			key in twic.options.inDB_
				? 'update options set val = ? where key = ?'
				: 'insert into options (val, key) values (?, ?)',
			[value.toString(), key],
			function() {
				twic.options.inDB_[key] = 1;
				twic.options.storage_[key] = value;
			}
		);
	}
};

twic.db.openQuery('select key, val from options', [],
	function(rows) {
		var
			row, key, val, i;

		for (i = 0; i < rows.length; ++i) {
			row = rows.item(i);
			key = row['key'];

			if (key in twic.options.storage_) {
				twic.options.inDB_[key] = 1;

				if (goog.isBoolean(twic.options.storage_[key])) {
					val = row['val'] === true.toString();
				} else {
					val = row['val'];
				}

				twic.options.storage_[key] = val;
			} else {
				// removing the key from database
				twic.db.execQuery('delete from options where key = ?', [key]);
			}
		}
	}
);

twic.requests.subscribe('getOpt', function(data, sendResponse) {
	sendResponse( twic.options.getValue(data) );
} );

twic.requests.subscribe('setOpt', function(data, sendResponse) {
	sendResponse( { } );

	twic.options.setValue(data['key'], data['value']);
} );

