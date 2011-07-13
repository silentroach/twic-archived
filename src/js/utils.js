/**
 * Some utils
 *
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

twic.utils = { };

/**
 * Iterate array in the iterator function in series
 * @param {Array|NodeList} arr Array of functions to execute
 * @param {function(*, function())} iterator Iterator with callback
 * @param {function(*=)} callback Finished callback
 */
twic.utils.queueIterator = function(arr, iterator, callback) {
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

twic.utils.date = { };

/**
 * Get the timestamp from Date
 * @param {Date} dt Date
 * @return {number} Timestamp
 */
twic.utils.date.getTimestamp = function(dt) {
	return Math.floor(dt.getTime() / 1000);
};

/**
 * Get the current timestamp
 * @return {number} Timestamp
 */
twic.utils.date.getCurrentTimestamp = function() {
	return twic.utils.date.getTimestamp(new Date());
};

twic.utils.lang = { };

/**
 * Translate the message
 * @param {...*} args
 */
twic.utils.lang.translate = function(args) {
	return chrome.i18n.getMessage.apply(chrome, arguments);
};

/**
 * Plural form
 * (яблоко, яблока, яблок)
 * @param {number} number Number
 * @param {Array.<string>} endings Translate aliases to endings
 */
twic.utils.lang.plural = function(number, endings) {
	var
		mod10  = number % 10,
		mod100 = number % 100,
		res = '';

	if (
		mod10 == 1
		&& mod100 != 11
	) {
		res = twic.utils.lang.translate(endings[0]);
	} else
	if (
		mod10 >= 2
		&& mod10 <= 4
		&& (
			mod100 < 10
			|| mod100 >= 20
		)
	) {
		res = twic.utils.lang.translate(endings[1]);
	} else {
		res = twic.utils.lang.translate(endings[2]);
	}

	return number + ' ' + res;
}

twic.utils.url = { };

/**
 * Humanize the link
 * @param {string} url Url
 * @return {string}
 */
twic.utils.url.humanize = function(url) {
	var
		cutted = url
			.replace(/^(.*?)\/\//, '')  // cutting the protocol
			.replace(/^www\./, ''),     // cutting 'www.',
		clen = cutted.length,
		title = url;

	if (
		clen > 6
		&& '4sq.com' === cutted.substr(0, 7)
	) {
		title = 'foursquare - ' + url;
		cutted = '<img src="https://foursquare.com/favicon.ico" class="aicon" />';
	} else
	if (clen > 30) {
		cutted = cutted.substring(0, 30) + '&hellip;';
	}	else
	if (['/', '\\'].indexOf(cutted.substring(clen - 1)) >= 0) {
		cutted = cutted.substring(0, clen - 1);
	}

	// fix url without schema
	if (-1 === url.indexOf('://')) {
		url = 'http://' + url;
	}

	return '<a target="_blank" href="javascript:" data-url="' + url + '" title="' + title + '">' + cutted + '</a>';
};

twic.utils.url.processText = function(text) {
	var
		/**
		 * http://daringfireball.net/2010/07/improved_regex_for_matching_urls
		 * @type {RegExp}
		 */
		urlSearchPattern = /\b((?:[a-z][\w\-]+:(?:\/{1,3}|[a-z0-9%])|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'".,<>?«»“”‘’]))/gi;

	return text.replace(urlSearchPattern, twic.utils.url.humanize);
};
