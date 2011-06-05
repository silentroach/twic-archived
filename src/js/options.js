/**
 * Options
 *
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

twic.options = ( function() {

	var options = { };

	options.get = function(key, callback) {
		twic.requests.makeRequest('getOpt', key, callback);
	};

	options.set = function(key, value) {
		twic.requests.makeRequest('setOpt', {
			'key': key,
			'value': value
		} );
	};

	return options;

}() );
