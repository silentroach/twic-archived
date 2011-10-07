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
		className: 'tumblr'
	},
	/*
	'instagr.am': {
		className: 'instagram',
		thumbnail: function(query) {
			return 'http://instagr.am/' + query + '/media?size=t';
		}
	},*/
	'4sq.com': {
		className: 'foursquare'
	},
	'flickr.com': {
		className: 'flickr'
	},
	'i.imgur.com': {
		className: 'imgur',
		thumbnail: function(query) {
			var
				parts = query.split('/');

			if (
				parts.length === 1
				|| (
					parts.length === 2
					&& 'gallery' === parts[0]
				)
			) {
				var
					lastPart = parts.pop(),
					lastParts = lastPart.split('.'),
					ext = lastParts.length > 1 ? lastParts.pop() : 'jpg',
					pictureName = lastParts.pop();

				if (pictureName.length > 3) {
					return 'http://i.imgur.com/' + pictureName + (pictureName.substr(-1) == 'l' ? '' : 'l') + '.' + ext;
				}
			}

			return false;
		}
	},
	'twitpic.com': {
		className: 'twitpic',
		thumbnail: function(query) {
			var
				parts = query.split('/');

			if (1 === parts.length) {
				return 'http://twitpic.com/show/thumb/' + parts.pop();
			}

			return false;
		}
	},
	'yfrog.com': {
		className: 'yfrog',
		thumbnail: function(query) {
			var
				parts = query.split('/');

			if (parts.length > 0) {
				var
					lastPart = parts.pop();

				if (
					lastPart.length > 4
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
		className: 'imgly',
		thumbnail: function(query) {
			var
				parts = query.split('/');

			if (parts.length > 0) {
				var
					lastPart = parts.pop();

				if (
					lastPart.length > 3
				) {
					return 'http://img.ly/show/medium/' + lastPart;
				}
			}

			return false;
		}
	}
};

twic.services.getThumbnail = function(domain, query) {
	if (domain in twic.services.alternativeDomains_) {
		domain = twic.services.alternativeDomains_[domain];
	}

	if (domain in twic.services.list_) {
		var
			service = twic.services.list_[domain];

		if (
			service.thumbnail
			&& query.length > 1
		) {
			return service.thumbnail(
				// cutting first slash
				query.substr(1)
			);
		}
	}

	return false;
};

twic.services.getClassNameByDomain = function(domain) {
	if (domain in twic.services.alternativeDomains_) {
		domain = twic.services.alternativeDomains_[domain];
	}

	if (domain in twic.services.list_) {
		return twic.services.list_[domain].className;
	}

	return false;
};
