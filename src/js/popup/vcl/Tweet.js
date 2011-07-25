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

		/** @type {RegExp} */ nickSearchPattern   = /([^&\w\/]|^)(@\w+)/gi,
		/** @type {RegExp} */ hashSearchPattern   = /([^&\w\/]|^)(#([\w\u0080-\uffff]*))/gi,
		/** @type {RegExp} */ breaksSearchPattern = /\r?\n/,

		/** @type {Element} */ replyWrapper = twic.dom.expandElement('div'),
		/** @type {twic.vcl.TweetEditor} */ replier,

		/** @type {Object} */ mentioned = { },

		/** @type {number} */ authorId,
		/** @type {string} */ authorNick,
		/** @type {number} */ retweetedById,
		/** @type {string} */ rawText,
		/** @type {Object} */ links = { },

		/** @type {number} */ timelineId = timeline.getUserId(),
		/** @type {string} */ timelineNick = timeline.getUserNick(),

		wrapper      = twic.dom.expandElement('li#' + id + '.tweet'),
		avatarLink   = twic.dom.expandElement('a.avatar'),
		avatar       = twic.dom.expandElement('img.avatar'),
		rtAvatarLink = twic.dom.expandElement('a.avatar.retweeter'),
		rtAvatar     = twic.dom.expandElement('img.avatar'),
		tweetContent = twic.dom.expandElement('p'),
		clearer      = twic.dom.expandElement('div.clearer');

	/**
	 * @type {number}
	 * @private
	 */
	this.unixtime_ = 0;

	/**
	 * @type {boolean}
	 * @private
	 */
	this.isProtected_ = false;

	/**
	 * @type {Element}
	 * @private
	 */
	this.clientSpan_ = twic.dom.expandElement('span.client');

	/**
	 * @type {Element}
	 * @private
	 */
	this.otherInfo_ = twic.dom.expandElement('p.info');

	/**
	 * @type {Element}
	 * @private
	 */
	this.timeSpan_ = twic.dom.expandElement('span.time');

	twic.dom.setVisibility(rtAvatarLink, false);

	avatarLink.appendChild(avatar);
	rtAvatarLink.appendChild(rtAvatar);

	wrapper.appendChild(avatarLink);
	wrapper.appendChild(rtAvatarLink);
	wrapper.appendChild(tweetContent);
	wrapper.appendChild(this.otherInfo_);
	wrapper.appendChild(clearer);
	wrapper.appendChild(replyWrapper);

	/**
	 * Set the tweet text
	 * @param {string} text
	 */
	tweet.setText = function(text) {
		var txt = twic.utils.url.processText(text, links);

		rawText = text;

		// preparing hashtags
		txt = txt.replace(
			hashSearchPattern,
			'$1<a class="hash" target="_blank" href="http://search.twitter.com/search?q=%23$3">$2</a>'
		);

		// preparing nicks
		txt = txt.replace(
			nickSearchPattern,
			function(nick) {
				var n = nick.trim().substring(1);

				if (n.substr(0, 1) == '@') {
					n = n.substring(1);
				}

				if (timelineNick === n) {
					// this tweet is with our mention
					wrapper.classList.add('mention');
				}

				mentioned[n.toLowerCase()] = '@' + n;

				return nick.replace('@' + n, '<a class="nick" href="#profile#' + n.toLowerCase() + '">@' + n + '</a>');
			}
		);

		// preparing line breaks
		txt = txt.replace(
			breaksSearchPattern,
			'<br />'
		);

		tweetContent.innerHTML = txt + '<br />';
	};

	tweet.setLinks = function(linksHash) {
		links = linksHash;
	};

	/**
	 * Add a separator
	 */
	tweet.setSeparator = function() {
		wrapper.classList.add('separator');
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
	 * @return {string}
	 */
	tweet.getRawText = function() {
		return rawText;
	};

	/**
	 * @return {string}
	 */
	tweet.getAuthorNick = function() {
		return authorNick;
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
		return replier;
	};

	var resetTweetEditor = function() {
		wrapper.classList.remove('replying');
		replier = null;
	};

	tweet.resetEditor = function() {
		if (replier) {
			replier.close();
			resetTweetEditor();
		}
	};

	tweet.getCanRetweet = function() {
		return !this.isProtected_ && authorId !== timelineId && retweetedById !== timelineId;
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

	/**
	 * @param {boolean=} all Reply to all mentioned
	 */
	tweet.reply = function(all) {
		var
			/** @type {string} **/ replyNick = authorNick,
			/** @type {string} **/ nickList = '@' + replyNick + ' ';

		if (all) {
			var
				/** @type {string} **/ nick,
				nicks = mentioned;

			if (replyNick.toLowerCase() in nicks) {
				delete nicks[replyNick.toLowerCase()];
			}

			for (nick in nicks) {
				nickList += nicks[nick] + ' ';
			}
		}

		replier = new twic.vcl.TweetEditor(timelineId, replyWrapper, id);
		replier.autoRemovable = true;
		replier.onTweetSend = tweet.onReplySend;
		replier.setConstTextIfEmpty(nickList);
		replier.setFocus();

		replier.onClose = resetTweetEditor;
		replier.onGetSuggestList = timeline.onReplierGetSuggestList;

		wrapper.classList.add('replying');
	};

};

/**
 * @type {string}
 * @private
 */
twic.vcl.Tweet.prototype.trAgo_ = twic.utils.lang.translate('time_ago');

twic.vcl.Tweet.prototype.updateTime = function() {
	if (0 === this.unixtime_) {
		return false;
	}

	var
		desc = '',
		now = twic.utils.date.getCurrentTimestamp(),
		df = now - this.unixtime_;

	// less than minute ago
	if (df < 60) {
		desc = twic.utils.lang.translate('time_less_minute') + ' ' + this.trAgo_;
	} else
	// less than hour ago
	if (df < 60 * 60) {
		desc = twic.utils.lang.plural( Math.floor(df / 60), [
			'time_minute_one',
			'time_minute_much',
			'time_minute_many'
		] ) + ' ' + this.trAgo_;
	} else
	// less than day ago
	if (df < 60 * 60 * 24) {
		desc = twic.utils.lang.plural( Math.floor(df / 60 / 60), [
			'time_hour_one',
			'time_hour_much',
			'time_hour_many'
		] ) + ' ' + this.trAgo_;
	} else {
		var
			dt = new Date(this.unixtime_ * 1000);

		desc = dt.getDay() + ' ' +
			twic.utils.lang.translate('time_month_' + (dt.getMonth() + 1));
	}

	this.timeSpan_.innerText = desc;
};

/**
 * Set the time
 * @param {number} newUnixTime New unix time
 */
twic.vcl.Tweet.prototype.setUnixTime = function(newUnixTime) {
	this.unixtime_ = newUnixTime;

	this.updateTime();
	this.otherInfo_.appendChild(this.timeSpan_);
};

/**
 * Set the tweet as protected
 */
twic.vcl.Tweet.prototype.setProtected = function() {
	this.isProtected_ = true;
};

/**
 * Set the source
 * @param {string} newSource Tweet source (client)
 */
twic.vcl.Tweet.prototype.setSource = function(newSource) {
	this.clientSpan_.innerHTML = (0 !== this.unixtime_ ? ' ' + twic.utils.lang.translate('via') + ' ' : '') +
		newSource.replace('<a ', '<a target="_blank" ');
	this.otherInfo_.appendChild(this.clientSpan_);
};

/**
 * Handler for tweet send process
 * @param {twic.vcl.TweetEditor} editor Editor
 * @param {string} tweetText Tweet text
 * @param {string=} replyTo Reply to tweet
 * @param {function()=} callback Callback
 */
twic.vcl.Tweet.prototype.onReplySend = function(editor, tweetText, replyTo, callback) { };
