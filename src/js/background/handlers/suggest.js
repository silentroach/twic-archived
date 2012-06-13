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
     * @param {number} userId User id
     * @param {string} part Nick start part
     * @param {function(Array)} callback Callback with result
     */
    var getNickSuggestList = function(userId, part, callback) {
        var
            cacheKey = 'suggest_' + userId + '_' + part,
            result = twic.cache.get(cacheKey);

        if (null !== result) {
            callback(result);
            return true;
        }

        twic.db.openQuery(
            'select distinct(screen_name) ' +
            'from ( ' +
                'select u.screen_name ' +
                'from timeline tl ' +
                    'inner join tweets t on (tl.tweet_id = t.id) ' +
                    'inner join users u on (t.user_id = u.id) ' +
                'where tl.user_id = ? and u.screen_name_lower like ? and u.screen_name_lower <> ? ' +
                'union ' +
                'select u.screen_name ' +
                'from mentions m ' +
                    'inner join tweets t on (m.tweet_id = t.id) ' +
                    'inner join users u on (t.user_id = u.id) ' +
                'where m.user_id = ? and u.screen_name_lower like ? and u.screen_name_lower <> ? ' +
            ') ' +
            'order by screen_name ' +
            'limit 5',
            [
                userId, part + '%', part,
                userId, part + '%', part
            ],
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
            /** @type {number} **/ userId   = data['userId'],
            /** @type {string} **/ nickPart = data['nickPart'];

        getNickSuggestList(userId, nickPart, function(list) {
            sendResponse(list);
        } );
    } );

}() );
