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
		/**
		 * http://daringfireball.net/2010/07/improved_regex_for_matching_urls
		 * @type {RegExp}
		 */
		urlSearchPattern    = /\b((?:[a-z][\w-]+:(?:\/{1,3}|[a-z0-9%])|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'".,<>?«»“”‘’]))/gi,

		/** @type {RegExp} */ nickSearchPattern   = /[\@]+(\w+)/gi,
		/** @type {RegExp} */ hashSearchPattern   = /[\#]+(\w+)/gi,
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

	/**
	 * Set the tweet text
	 * @param {string} text
	 */
	var setText = function(text) {
		// preparing urls
		var txt = text.replace(
			urlSearchPattern,
			function(url) {
				var
					i = url.indexOf('//'),
					cutted = i > 0 ? url.substring(i + 2) : url;

				return '<a target="_blank" href="' + url + '" title="' + url + '">' +
					(cutted.length > 30 ? (cutted.substring(0, 30) + '&hellip;') : cutted) +
					'</a>';
			}
		);

		// preparing hashtags
		txt = txt.replace(
			hashSearchPattern,
			'<a class="hash" target="_blank" href="http://search.twitter.com/search?q=%23$1">#$1</a>'
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
		/**
		 * Get the tweet element
		 * @return {HTMLElement}
		 */
		getElement: function() {
			return wrapper;
		},
		/**
		 * @return {HTMLElement}
		 */
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

