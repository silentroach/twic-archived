/**
 * Part of ASync Node.js module
 * http://github.com/caolan/async/downloads
 */

var async = { };

/**
 * Iterate array in the iterator function in parallel
 * @param {Array|NodeList} arr Array of functions to execute
 * @param {function(*, function())} iterator Iterator with callback
 * @param {function(*=)} callback Finished callback
 */
async.forEach = function (arr, iterator, callback) {
	if (!arr.length) {
		return callback();
	}

    var
		completed = 0,
		i;

	for (i = 0; i < arr.length; i++) {
		iterator(arr[i], function (err) {
			if (err) {
				callback(err);
				callback = function () {};
			} else {
				completed += 1;
				if (completed === arr.length) {
					callback();
				}
			}
		} );
	};
};

/**
 * Iterate array in the iterator function in series
 * @param {Array|NodeList} arr Array of functions to execute
 * @param {function(*, function())} iterator Iterator with callback
 * @param {function(*=)} callback Finished callback
 */
async.forEachSeries = function(arr, iterator, callback) {
	if (!arr.length) {
		return callback();
	}

	var
		aLen = arr.length,
		completed = 0;

	var iterate = function () {
		iterator(arr[completed], function (err) {
			if (err) {
				callback(err);
				callback = function () {};
			} else {
				++completed;

				if (completed === aLen) {
					callback();
				} else {
					iterate();
				}
			}
		} );
	};

	iterate();
};
