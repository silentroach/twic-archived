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

		/** @type {RegExp} */ nickSearchPattern   = /[\@]+(\w+)/gi,
		/** @type {RegExp} */ hashSearchPattern   = /([^&\w]|^)(#([\w\u0080-\uffff]*))/gi,
		/** @type {RegExp} */ breaksSearchPattern = /\r?\n/,

		/** @type {Element} */ replyWrapper = twic.dom.expandElement('div'),
		/** @type {twic.vcl.TweetEditor} */ replyer,

		/** @type {number} */ authorId,
		/** @type {string} */ authorNick,
		/** @type {number} */ retweetedById,

		/** @type {number} */ timelineId = timeline.getUserId(),
		/** @type {string} */ timelineNick = timeline.getUserNick(),

		wrapper      = twic.dom.expandElement('li#' + id + '.tweet'),
		avatarLink   = twic.dom.expandElement('a.avatar'),
		avatar       = twic.dom.expandElement('img.avatar'),
		rtAvatarLink = twic.dom.expandElement('a.avatar.retweeter'),
		rtAvatar     = twic.dom.expandElement('img.avatar'),
		tweetContent = twic.dom.expandElement('p'),
		clearer      = twic.dom.expandElement('div.clearer'),

		isRetweet        = false;

	rtAvatarLink.style.display = 'none';

	avatarLink.appendChild(avatar);
	rtAvatarLink.appendChild(rtAvatar);

	wrapper.appendChild(avatarLink);
	wrapper.appendChild(rtAvatarLink);
	wrapper.appendChild(tweetContent);
	wrapper.appendChild(clearer);
	wrapper.appendChild(replyWrapper);

	/**
	 * Set the tweet text
	 * @param {string} text
	 */
	tweet.setText = function(text) {
		var txt = twic.utils.url.processText(text);

		// preparing hashtags
		txt = txt.replace(
			hashSearchPattern,
			'$1<a class="hash" target="_blank" href="http://search.twitter.com/search?q=%23$3">$2</a>'
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

		tweetContent.innerHTML = txt + '<br />';
	};

	/**
	 * Set author info
	 * @param {number} id Author identifier
	 * @param {string} nick Tweet author nick
	 * @param {string} av User avatar src
	 */
	tweet.setAuthor = function(id, nick, av) {
		authorId = id;
		authorNick = nick;

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
		isRetweet = true;

		retweetedById = id;

		if (retweetedById === timelineId) {
			wrapper.classList.add('me');
		}

		rtAvatarLink.title = twic.utils.lang.translate('title_retweeted_by', '@' + nick);
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
	 * @return {Element}
	 */
	tweet.getElement = function() {
		return wrapper;
	};

	/**
	 * Tweet id
	 * @return {string}
	 */
	tweet.getId = function() {
		return id;
	};

	tweet.isReplying = function() {
		return replyer;
	};

	tweet.resetEditor = function() {
		if (replyer) {
			replyer = null;
		}
	};

	tweet.getCanRetweet = function() {
		return authorId !== timelineId && retweetedById !== timelineId;
	};

	tweet.getCanUnRetweet = function() {
		return retweetedById === timelineId;
	};

	tweet.getCanDelete = function() {
		return authorId === timelineId;
	};

	tweet.getCanReply = function() {
		return true;
	};

	tweet.reply = function() {
		replyer = new twic.vcl.TweetEditor(timelineId, replyWrapper, id);
		replyer.setConstTextIfEmpty('@' + authorNick + ' ');
		replyer.setFocus();
	};

};
