/**
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

/**
 * Tweet element
 * @constructor
 * @param {twic.vcl.Timeline} timeline Timeline
 */
twic.vcl.Tweet = function(timeline) {

	var
		/** @type {RegExp} */ urlPattern          = /^https?:\/\/(www\.)?([^\/]+)?/gi,
		/** @type {RegExp} */ urlSearchPattern    = /[A-Za-z]+:\/\/[A-Za-z0-9-_]+\.[A-Za-z0-9-_:%&\?\/.=]+/g,
		/** @type {RegExp} */ nickSearchPattern   = /(@(\w*)(\/\w+)?)/gi,
		/** @type {RegExp} */ hashSearchPattern   = /(^|\s)#(\w+)/g,
		/** @type {RegExp} */ breaksSearchPattern = /\r?\n/,

		/** @type {number} */ authorId,

		/** @type {number} */ timelineId = timeline.getUserId(),
		/** @type {string} */ timelineNick = timeline.getUserNick(),

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

				if (timelineNick === n) {
					// this tweet is with our mention
					wrapper.classList.add('mention');
				}

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
		authorNick = nick;

		avatarLink.title = '@' + nick;
		avatarLink.href = '#profile#' + nick;
	};

	/**
	 * @param {!string} av User avatar src
	 */
	var setAuthorAvatar = function(av) {
		avatar.src = av;
	};

	/**
	 * @param {!number} id Tweet identifier
	 */
	var setAuthorId = function(id) {
		authorId = id;

		if (authorId === timelineId) {
			wrapper.classList.add('me');
		}
	};

	return {
		// todo where are annotations? ;)
		getElement: function() {
			return wrapper;
		},
		getAuthorId: function() {
			return authorId;
		},

		setId: setId,
		setText: setText,
		setAuthorNick: setAuthorNick,
		setAuthorId: setAuthorId,
		setAuthorAvatar: setAuthorAvatar
	};

};
