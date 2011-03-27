/**
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

/**
 * Tweet element
 * @constructor
 * @param {number} id Tweet identifier
 * @param {twic.vcl.Timeline} timeline Timeline
 */
twic.vcl.Tweet = function(id, timeline) {

	var
		tweet = this,

		/**
		 * http://daringfireball.net/2010/07/improved_regex_for_matching_urls
		 * @type {RegExp}
		 */
		urlSearchPattern    = /\b((?:[a-z][\w\-]+:(?:\/{1,3}|[a-z0-9%])|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'".,<>?«»“”‘’]))/gi,

		/** @type {RegExp} */ nickSearchPattern   = /[\@]+(\w+)/gi,
		/** @type {RegExp} */ hashSearchPattern   = /[\#]+(\w+)/gi,
		/** @type {RegExp} */ breaksSearchPattern = /\r?\n/,

		/** @type {number} */ authorId,
		/** @type {number} */ retweetedById,

		/** @type {number} */ timelineId = timeline.getUserId(),
		/** @type {string} */ timelineNick = timeline.getUserNick(),

		wrapper      = document.createElement('li'),
		avatarLink   = document.createElement('a'),
		avatar       = document.createElement('img'),
		tweetContent = document.createElement('p'),
		clearer      = document.createElement('div');

	wrapper.className    = 'tweet';
	wrapper.id = id;

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
	tweet.setText = function(text) {
		// preparing urls
		var txt = text.replace(
			urlSearchPattern,
			function(url) {
				var
					i = url.indexOf('//'),
					cutted = i > 0 ? url.substring(i + 2) : url;

				if (cutted.length > 30) {
					cutted = cutted.substring(0, 30) + '&hellip;';
				} else
				// stripping last slash
				if (['/', '\\'].indexOf(cutted.substring(cutted.length - 1)) >= 0) {
					cutted = cutted.substring(0, cutted.length - 1);
				}

				return '<a target="_blank" href="' + url + '" title="' + url + '">' + cutted + '</a>';
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
	 * Set author info
	 * @param {number} id Tweet identifier
	 * @param {string} nick Tweet author nick
	 * @param {string} av User avatar src
	 */
	tweet.setAuthor = function(id, nick, av) {
		authorId = id;

		if (authorId === timelineId) {
			wrapper.classList.add('me');
		}

		avatarLink.title = '@' + nick;
		avatarLink.href = '#profile#' + nick;

		avatar.src = av;
	};

	/**
	 * @return {number}
	 */
	tweet.getAuthorId = function() {
		return authorId;
	};

	/**
	 * Get the tweet element
	 * @return {!Element}
	 */
	tweet.getElement = function() {
		return wrapper;
	};

};
