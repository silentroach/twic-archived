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

// ------------------------------------------------------------

twic.utils.date = { };

/**
 * Get the timestamp from Date
 * @param {Date} dt Date
 * @return {number} Timestamp
 */
twic.utils.date.getTimestamp = function(dt) {
	return Math.round(dt.getTime() / 1000);
};

/**
 * Get the current timestamp
 * @return {number} Timestamp
 */
twic.utils.date.getCurrentTimestamp = function() {
	return Math.round(goog.now() / 1000);
};

// ------------------------------------------------------------

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
		mod10 === 1
		&& mod100 !== 11
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
};

// ------------------------------------------------------------

twic.utils.url = { };

/**
 * Mail search pattern
 * @type {RegExp}
 * @const
 * @private
 */
twic.utils.url.mailSearchPattern_ = /(([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+)/gi;

/**
 * http://daringfireball.net/2010/07/improved_regex_for_matching_urls
 * @type {RegExp}
 * @const
 * @private
 */
twic.utils.url.urlSearchPattern_ = /\b((?:[a-z][\w\-]+:(?:\/{1,3}|[a-z0-9%])|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'".,<>?«»“”‘’]))/gi;

/**
 * Extract domain name from url
 * @type {RegExp}
 * @const
 * @private
 */
twic.utils.url.domainExtractPattern_ = /:\/\/(.[^/]+)/;

/**
 * Links -> icons services hash
 * @const
 * @private
 */
twic.utils.url.services_ = {
	'tumblr.com': { name: 'tumblr',     favicon: 'https://tumblr.com/favicon.ico' },
	'instagr.am': { name: 'instagram',  favicon: 'https://instagr.am/favicon.ico' },
	'4sq.com':    { name: 'foursquare', favicon: 'https://foursquare.com/favicon.ico' },
	'flic.kr':    { name: 'flickr',     favicon: 'http://www.flickr.com/favicon.ico' }
};

/**
 * Humanize the link
 * @param {string} url Url
 * @param {Object.<string, string>=} lnks Shortened links hash
 * @return {string}
 */
twic.utils.url.humanize = function(url, lnks) {
	var
		links = lnks || { },
		expanded = url in links ? links[url] : url,
		domain = twic.utils.url.domainExtractPattern_.exec(expanded),
		domainName = domain && domain.length > 1 ? domain[1] : '',
		cutted = expanded
			.replace(/^(.*?)\/\//, '')         // cutting the protocol
			.replace(/^(www\.|mailto:)/, ''),  // cutting 'www.' and 'mailto:'
		clen = cutted.length,
		title = cutted;

	if (
		'' !== domainName
		&& domainName in twic.utils.url.services_
	) {
		var
			iconInfo = twic.utils.url.services_[domainName];

		title = iconInfo.name + ' - ' + expanded;
		cutted = '<img src="' + iconInfo.favicon + '" class="aicon" />';
	} else
	if (clen > 30) {
		cutted = cutted.substring(0, 30) + '&hellip;';
	} else
	if (['/', '\\'].indexOf(cutted.substring(clen - 1)) >= 0) {
		cutted = cutted.substring(0, clen - 1);
	}

	// simple links for mailto
	if (-1 !== url.indexOf('mailto:')) {
		return '<a target="_blank" href="' + url + '">' + cutted + '</a>';
	} else
	// fix url without schema
	if (-1 === url.indexOf('://')) {
		url = 'http://' + url;
	}

	//if (expanded != url) {
	//	title = title + ' \n ' + url;
	//}

	return '<a target="_blank" href="javascript:" data-url="' + url + '" title="' + title + '">' + cutted + '</a>';
};

/**
 * Process text replacements
 * @param {string} text Text
 * @param {Object=} links Shortened links hash
 * @return {string}
 */
twic.utils.url.processText = function(text, links) {
	var
		result = text.replace(twic.utils.url.mailSearchPattern_, 'mailto:$1');

	return twic.text.processUrls(result, function(url) {
		return twic.utils.url.humanize(url, links ? links : { });
	} );
};

/**
 * Get all links used in text
 * @param {string} text Text
 * @return {Array}
 */
twic.utils.url.extractLinks = function(text) {
	return text.match(twic.utils.url.urlSearchPattern_);
};
