/**
 * Some utils
 *
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

twic.utils = { };

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

twic.utils.url = { };

/**
 * Mail search pattern
 * @type {RegExp}
 * @const
 * @private
 */
twic.utils.url.mailSearchPattern_ = /(([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+)/gi;

/**
 * Extract domain name from url
 * @type {RegExp}
 * @const
 * @private
 */
twic.utils.url.domainExtractPattern_ = /:\/\/(.[^\/]+)/;

twic.utils.url.extractDomain = function(url) {
    return twic.utils.url.domainExtractPattern_.exec(url);
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
        expanded = url in links && links[url] ? links[url] : url,
        domain = twic.utils.url.extractDomain(expanded),
        domainName = domain && domain.length > 1 ? domain[1] : '',
        cutted = expanded
            .replace(/^(.*?)\/\//, '')         // cutting the protocol
            .replace(/^(www\.|mailto:)/, ''),  // cutting 'www.' and 'mailto:'
        clen = cutted.length,
        title = cutted,
        faviconUrl = twic.services.getFaviconByDomain(domainName),
        classes = '';

    if (faviconUrl) {
        classes = ' class="aicon"';
        cutted = '<img src="chrome://favicon/' + faviconUrl + '" />';
    } else
    if (clen > 30) {
        cutted = cutted.substring(0, 30) + '&hellip;';
    } else
    if (['/', '\\'].indexOf(cutted.substring(clen - 1)) >= 0) {
        cutted = cutted.substring(0, clen - 1);
    }

    // simple links for mailto
    //if (-1 !== url.indexOf('mailto:')) {
    //  return '<a target="_blank" href="' + url + '">' + cutted + '</a>';
    //} else
    // fix url without schema
    if (-1 === url.indexOf('://')) {
        url = 'http://' + url;
    }

    return '<a target="_blank"' + classes + ' href="' + url + '" title="' + title + '">' + cutted + '</a>';
};

/**
 * Process text replacements
 * @param {string} text Text
 * @param {Object=} links Shortened links hash
 * @return {string}
 */
twic.utils.url.processText = function(text, links) {
    //var
    //  result = text.replace(twic.utils.url.mailSearchPattern_, 'mailto:$1');

    return twic.text.processUrls(text, function(url) {
        return twic.utils.url.humanize(url, links ? links : { });
    } );
};
