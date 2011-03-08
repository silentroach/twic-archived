/**
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

/**
 * @constructor
 */
twic.vcl.Tweet = function() {

	var
		/** @type {RegExp} */ urlPattern          = /^https?:\/\/(www\.)?([^\/]+)?/i,
		/** @type {RegExp} */ urlSearchPattern    = /[A-Za-z]+:\/\/[A-Za-z0-9-_]+\.[A-Za-z0-9-_:%&\?\/.=]+/g,
		/** @type {RegExp} */ nickSearchPattern   = /(@(\w*)(\/\w+)?)/i,
		/** @type {RegExp} */ hashSearchPattern   = /(^|\s)#(\w+)/g,
		/** @type {RegExp} */ breaksSearchPattern = /\r?\n/,

		wrapper      = document.createElement('li'),
		avatarLink   = document.createElement('a'),
		avatar       = document.createElement('img'),
		tweetContent = document.createElement('p'),
		clearer      = document.createElement('div');

	wrapper.className    = 'tweet';
	clearer.className    = 'clearer';
	avatarLink.className = 'avatar';
	avatar.className     = 'avatar';

	avatarLink.appendChild(avatar);

	wrapper.appendChild(avatarLink);
	wrapper.appendChild(tweetContent);
	wrapper.appendChild(clearer);

	var setText = function(text) {
		// preparing urls
		var txt = text.replace(
			urlSearchPattern,
			function(url) {
				var
					stripped = url,
					parsed = urlPattern.exec(url);

				if (
					parsed
					&& parsed.length > 2
				) {
					stripped = parsed[2];
				} else
				if (stripped.length > 30) {
					stripped = stripped.substring(0, 30) + '&hellip;';
				}

				return '<a target="_blank" href="' + url + '" title="' + url + '">' + stripped + '</a>';
			}
		);

		// preparing nicks
		txt = txt.replace(
			nickSearchPattern,
			function(nick) {
				var n = nick.substring(1);

				return '<a class="nick" href="#profile#' + n.toLowerCase() + '">@' + n + '</a>';
			}
		);

		// preparing hashtags
		txt = txt.replace(
			hashSearchPattern,
			'$1<a class="hash" target="_blank" href="http://search.twitter.com/search?q=%23$2">#$2</a>'
		);

		// preparing line breaks
		txt = txt.replace(
			breaksSearchPattern,
			'<br />'
		);

		tweetContent.innerHTML = txt;
	};

	/**
	 * @param {!number} id Tweet identifier
	 */
	var setId = function(id) {
		wrapper.id = id;
	};

	/**
	 * @param {!string} nick Tweet author nick
	 */
	var setAuthorNick = function(nick) {
		avatarLink.title = '@' + nick;
		avatarLink.href = '#profile#' + nick;
	};

	/**
	 * @param {!string} av User avatar src
	 */
	var setAuthorAvatar = function(av) {
		avatar.src = av;
	};

	return {
		getElement: function() {
			return wrapper;
		},

		setId: setId,
		setText: setText,
		setAuthorNick: setAuthorNick,
		setAuthorAvatar: setAuthorAvatar
	};

};