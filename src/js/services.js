/**
 * External services object
 *
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

twic.services = { };

/**
 * @private
 */
twic.services.alternativeDomains_ = {
    'yfrog.us': 'yfrog.com',
    'www.yfrog.com': 'yfrog.com',
    'imgur.com': 'i.imgur.com',
    'flic.kr': 'flickr.com',
    'www.flickr.com': 'flickr.com'
};

/**
 * @private
 */
twic.services.list_ = {
    'tumblr.com': {
        url: 'https://www.tumblr.com/'
    },
    'instagr.am': {
        url: 'http://instagr.am/',
        thumbnail: function(query) {
            var
                parts = query.split('/');

            if (2 === parts.length
                && 'p' === parts[0]
            ) {
                return 'http://instagr.am/' + query + '/media?size=l';
            }

            return false;
        }
    },
    '4sq.com': {
        url: 'https://foursquare.com/'
    },
    'flickr.com': {
        url: 'http://www.flickr.com/'
    },
    'i.imgur.com': {
        url: 'http://imgur.com/',
        thumbnail: function(query) {
            var
                parts = query.split('/');

            if (parts.length === 1
                || (parts.length === 2
                    && 'gallery' === parts[0]
                )
            ) {
                var
                    lastPart = parts.pop(),
                    lastParts = lastPart.split('.'),
                    ext = lastParts.length > 1 ? lastParts.pop() : 'jpg',
                    pictureName = lastParts.pop();

                if (pictureName.length > 3) {
                    return 'http://i.imgur.com/' + pictureName +
                        (pictureName.substr(-1) === 'l' ? '' : 'l') +
                        '.' + ext;
                }
            }

            return false;
        }
    },
    'twitpic.com': {
        url: 'http://twitpic.com/',
        thumbnail: function(query) {
            var
                parts = query.split('/');

            if (1 === parts.length) {
                return 'http://twitpic.com/show/large/' + parts.pop();
            }

            return false;
        }
    },
    'yfrog.com': {
        url: 'http://yfrog.com/',
        thumbnail: function(query) {
            var
                parts = query.split('/');

            if (parts.length > 0) {
                var
                    lastPart = parts.pop();

                if (lastPart.length > 4
                    // j - jpeg
                    // p - png
                    // b - bmp
                    // t - tiff
                    // g - gif
                    && ['j', 'p', 'b', 't', 'g'].indexOf(lastPart.substr(-1)) >= 0
                ) {
                    return 'https://yfrog.com/' + lastPart + ':iphone';
                }
            }

            return false;
        }
    },
    'img.ly': {
        url: 'http://img.ly/',
        thumbnail: function(query) {
            var
                parts = query.split('/');

            if (parts.length > 0) {
                var
                    lastPart = parts.pop();

                if (lastPart.length > 3) {
                    return 'http://img.ly/show/medium/' + lastPart;
                }
            }

            return false;
        }
    }
};

/**
 * Get the thumbnail for service image url
 * @param {string} domain Domain
 * @param {string} query Query
 * @return {string|null}
 */
twic.services.getThumbnail = function(domain, query) {
    if (domain in twic.services.alternativeDomains_) {
        domain = twic.services.alternativeDomains_[domain];
    }

    if (domain in twic.services.list_) {
        var
            service = twic.services.list_[domain];

        if (service.thumbnail
            && query.length > 1
        ) {
            return service.thumbnail(
                // trimming last, first and double slashes
                query.replace(/^\/|\/$/g, '')
            );
        }
    }

    return null;
};

/**
 * Get service url for chrome://favicon/[url] by domain
 * @param {string} domain Domain
 * @return {string|null}
 */
twic.services.getUrlByDomain = function(domain) {
    if (domain in twic.services.alternativeDomains_) {
        domain = twic.services.alternativeDomains_[domain];
    }

    if (domain in twic.services.list_) {
        return twic.services.list_[domain].url;
    }

    return null;
};
