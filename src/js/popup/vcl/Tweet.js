/**
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

/**
 * Tweet element
 * @constructor
 * @param {string} id Tweet identifier
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

		wrapper      = twic.dom.expand('li#' + id + '.tweet'),
		avatarLink   = twic.dom.expand('a.avatar'),
		avatar       = twic.dom.expand('img.avatar'),
		rtAvatarLink = twic.dom.expand('a.avatar.retweeter'),
		rtAvatar     = twic.dom.expand('img.avatar'),
		tweetContent = twic.dom.expand('p'),
		clearer      = twic.dom.expand('div.clearer');

	rtAvatarLink.style.display = 'none';

	avatarLink.appendChild(avatar);
	rtAvatarLink.appendChild(rtAvatar);

	wrapper.appendChild(avatarLink);
	wrapper.appendChild(rtAvatarLink);
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
	 * @param {number} id Author identifier
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
	 * Set retweeter info
	 * @param {number} id Retweet author identifier
	 * @param {string} nick Retweet author nick
	 * @param {string} av User avatar src
	 */
	tweet.setRetweeter = function(id, nick, av) {
		retweetedById = id;

		if (retweetedById === timelineId) {
			wrapper.classList.add('me');
		}

		rtAvatarLink.title = '@' + nick;
		rtAvatarLink.href = '#profile#' + nick;

		rtAvatar.src = av;

		rtAvatarLink.style.display = 'block';

		wrapper.classList.add('retweet');
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
