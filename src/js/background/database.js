/**
 * Object to work with database (new one)
 *
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

twic.database = { };

/**
 * Database name
 * @const
 * @type {string}
 */
twic.database.NAME = 'Twic';

/**
 * Database version
 * @const
 * @type {number}
 */
twic.database.VERSION = 10;

/**
 * @private
 */
twic.database.idb_ = window['indexedDB'] || window['webkitIndexedDB'];

/**
 * @type {IDBDatabase}
 * @private
 */
twic.database.db_ = null;

/**
 * @private
 */
twic.database.upgrade_ = function(version, callback) {
    var
        request = twic.database.db_.setVersion(twic.database.VERSION);

    request.onsuccess = function(event) {
        if (version < 3) {
            console.log('creating');
            twic.database.db_.createObjectStore('accounts', { 'keyPath': 'id' } );
            twic.database.db_.createObjectStore('users', { 'keyPath': 'id' } );
            twic.database.db_.createObjectStore('tweets', { 'keyPath': 'id' } );
        }

        callback();
    };
}

/**
 * @private
 */
twic.database.handleError_ = function(event) {
    console.dir(event);
}

/**
 * @private
 */
twic.database.open_ = function(callback) {
    var reply = function() {
        callback(twic.database.db_);
    };

    if (twic.database.db_) {
        reply();
        return true;
    }

    var
        request = twic.database.idb_.open(twic.database.NAME, twic.database.VERSION);

    request.onerror = twic.database.handleError_;
    request.onsuccess = function() {
        var
            version = parseInt(request.result.version, 10);

        twic.database.db_ = request.result;

        if (version !== twic.database.VERSION) {
            twic.database.upgrade_(version, reply)
        } else {
            reply();
        }
    };
};