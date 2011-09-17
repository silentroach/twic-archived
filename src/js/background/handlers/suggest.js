/**
 * Suggest support
 *
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

// TODO make suggest unique for each account

( function() {

	var
		/** @const **/ cacheTime = 10 * 60;

	/**
	 * Get the nick suggest list
	 * @param {string} part Nick start part
	 * @param {function(Array)} callback Callback with result
	 */
	var getNickSuggestList = function(part, callback) {
		var
			cacheKey = 'suggest_' + part;
			result = twic.cache.get(cacheKey);

		if (null !== result) {
			callback(result);
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

				twic.cache.set(cacheKey, result, cacheTime);

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
