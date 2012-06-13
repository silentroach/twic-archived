/**
 * Options
 *
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

twic.options = { };

twic.options.get = function(key, callback) {
    twic.requests.makeRequest('getOpt', key, callback);
};

twic.options.set = function(key, value) {
    twic.requests.makeRequest('setOpt', {
        'key': key,
        'value': value
    } );
};
