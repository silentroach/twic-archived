/**
 * Suggest support
 *
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

( function() {

	var
		/** @const **/ cacheTime = 10 * 60 * 1000,
		cache = { };

	// cleanup for suggest cache every cacheTime
	setInterval( function() {
		var
			now = twic.utils.date.getCurrentTimestamp(),
			part;

		twic.debug.info('Suggest cleanup');

		for (part in cache) {
			if (now - cache[part].dt > cacheTime / 1000) {
				delete cache[part];
			}
		}
	}, cacheTime );

	/**
	 * Get the nick suggest list
	 * @param {string} part Nick start part
	 * @param {function(Array)} callback Callback with result
	 */
	var getNickSuggestList = function(part, callback) {
		var
			now = twic.utils.date.getCurrentTimestamp();

		if (part in cache) {
			cache[part].dt = now;
			callback( cache[part].result );
			return true;
		}

		twic.db.openQuery(
			'select screen_name from users where screen_name_lower like ? and screen_name_lower <> ? limit 5',
			[part + '%', part],
			function(rows) {
				var
					result = [],
					i;

				for (i = 0; i < rows.length; ++i) {
					result.push(rows.item(i)['screen_name']);
				}

				cache[part] = {
					dt: now,
					result: result
				};

				callback( result );
			}
		);
	};

	twic.requests.subscribe('getNickSuggest', function(data, sendResponse) {
		var
			/** @type {string} **/ nickPart = data['nickPart'];

		getNickSuggestList( nickPart, function( list ) {
			sendResponse( list );
		} );
	} );

}() );
