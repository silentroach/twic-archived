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

	/**
	 * @type {string}
	 * @private
	 */
	this.id_ = id;

	/**
	 * @type {string}
	 * @private
	 */
	this.replyTo_ = '';

	/**
	 * @type {twic.vcl.Timeline}
	 * @private
	 */
	this.timeline_ = timeline;

	/**
	 * @type {number}
	 * @private
	 */
	this.timelineId_ = this.timeline_.getUserId();

	/**
	 * @type {Element}
	 * @private
	 */
	this.avatar_ = twic.dom.expandElement('img.avatar');

	/**
	 * @type {Element}
	 * @private
	 */
	this.avatarLink_ = twic.dom.expandElement('a.avatar');

	/**
	 * @type {Element}
	 * @private
	 */
	this.rtAvatarLink_ = twic.dom.expandElement('a.avatar.retweeter');

	/**
	 * @type {Element}
	 * @private
	 */
	this.rtAvatar_ = twic.dom.expandElement('img.avatar');

	/**
	 * @type {Element}
	 * @private
	 */
	this.wrapper_ = twic.dom.expandElement('li#' + this.id_ + '.tweet');

	/**
	 * @type {Element}
	 * @private
	 */
	this.tweetContent_ = twic.dom.expandElement('p');

	/**
	 * @type {string}
	 * @private
	 */
	this.timelineNick_ = this.timeline_.getUserNick();

	/**
	 * @type {Object}
	 * @private
	 */
	this.mentioned_ = { };

	/**
	 * @type {number}
	 * @private
	 */
	this.authorId_ = 0;

	/**
	 * @type {string}
	 * @private
	 */
	this.authorNick_ = '';

	/**
	 * @type {number}
	 * @private
	 */
	this.retweetedById_ = 0;

	/**
	 * @type {string}
	 * @private
	 */
	this.rawText_ = '';

	/**
	 * @type {Object.<string, string>}
	 * @private
	 */
	this.links_ = { };

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
	 * @type {Array}
	 * @private
	 */
	this.geo_ = null;

	/**
	 * @type {twic.vcl.TweetEditor}
	 */
	this.replier_ = null;

	/**
	 * @type {?Array}
	 * @private
	 */
	this.images_ = null;

	/**
	 * Is gallery visible?
	 * @type {boolean}
	 * @private
	 */
	this.galleryVisible_ = false;

	/**
	 * @type {twic.vcl.Map}
	 * @private
	 */
	this.map_ = null;

	/**
	 * Is map visible?
	 * @type {boolean}
	 * @private
	 */
	this.mapVisible_ = false;

	/**
	 * @type {Element}
	 * @private
	 */
	this.timeSpan_ = twic.dom.expandElement('span.time');

	/**
	 * @type {Element}
	 * @private
	 */
	this.timeLink_ = null;

	/**
	 * @type {Element}
	 * @private
	 */
	this.otherInfo_ = twic.dom.expandElement('p.info');

	/**
	 * @type {Element}
	 * @private
	 */
	this.replyWrapper_ = twic.dom.expandElement('div');

	/**
	 * @type {Element}
	 * @private
	 */
	this.infoWrapper_ = twic.dom.expandElement('div.infoWrapper');

	/**
	 * @type {Element}
	 * @private
	 */
	this.infoMap_ = null;

	/**
	 * @type {Element}
	 * @private
	 */
	this.infoGallery_ = null;

	twic.dom.setVisibility(this.rtAvatarLink_, false);

	this.avatarLink_.appendChild(this.avatar_);
	this.rtAvatarLink_.appendChild(this.rtAvatar_);

	this.wrapper_.appendChild(this.avatarLink_);
	this.wrapper_.appendChild(this.rtAvatarLink_);
	this.wrapper_.appendChild(this.tweetContent_);
	this.wrapper_.appendChild(this.otherInfo_);
	this.wrapper_.appendChild(twic.dom.expandElement('div.clearer'));
	this.wrapper_.appendChild(this.infoWrapper_);
	this.wrapper_.appendChild(this.replyWrapper_);
};

/**
 * @type {RegExp}
 * @const
 */
twic.vcl.Tweet.REGEXP_BREAK = /\r?\n/;

/**
 * @type {string}
 * @private
 */
twic.vcl.Tweet.prototype.trAgo_ = twic.utils.lang.translate('time_ago');

/**
 * Get the tweet author id
 * @return {number}
 */
twic.vcl.Tweet.prototype.getAuthorId = function() {
	return this.authorId_;
};

/**
 * Get the tweet author nick
 * @return {string}
 */
twic.vcl.Tweet.prototype.getAuthorNick = function() {
	return this.authorNick_;
};

/**
 * Set the reply to id
 * @param {string} mmm Tweet id
 */
twic.vcl.Tweet.prototype.setReplyTo = function(mmm) {
	this.replyTo_ = mmm;
};

/**
 * Update the tweet time
 */
twic.vcl.Tweet.prototype.updateTime = function() {
	if (0 === this.unixtime_) {
		return;
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

		desc = dt.getDate() + ' ' +
			twic.utils.lang.translate('time_month_' + (dt.getMonth() + 1));
	}

	if (this.timeLink_) {
		this.timeLink_.innerText = desc;
	} else {
		this.timeSpan_.innerText = desc;
	}
};

/**
 * Set the tweet text
 * @param {string} text
 */
twic.vcl.Tweet.prototype.setText = function(text) {
	var
		txt = twic.utils.url.processText(text, this.links_),
		tweet = this;

	this.rawText_ = text;

	// preparing hashtags
	txt = twic.text.processHashes(txt, function(hash) {
		return '<a class="hash" target="_blank" href="http://search.twitter.com/search?q=%23' + encodeURIComponent(hash) + '">#' + hash + '</a>';
	} );

	// preparing nicks
	txt = twic.text.processMentions(txt, function(nick) {
		var
			nickLowered = nick.toLowerCase();

		if (nick === tweet.timelineNick_) {
			// this tweet is with our mention
			tweet.wrapper_.classList.add('mention');
		}

		tweet.mentioned_[nickLowered] = '@' + nick;

		return '<a class="nick" href="#profile#' + nickLowered + '">@' + nick + '</a>';
	} );

	// preparing line breaks
	txt = txt.replace(
		twic.vcl.Tweet.REGEXP_BREAK,
		'<br />'
	);

	this.tweetContent_.innerHTML = txt + '<br />';
};

/**
 * Set the time
 * @param {number} newUnixTime New unix time
 * @param {boolean} asLink Show tweet time as link
 */
twic.vcl.Tweet.prototype.setUnixTime = function(newUnixTime, asLink) {
	this.unixtime_ = newUnixTime;

	if (asLink) {
		this.timeLink_ = twic.dom.expandElement('a');

		this.timeSpan_.appendChild(this.timeLink_);
	}

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
 * Add the separator
 */
twic.vcl.Tweet.prototype.setSeparator = function() {
	this.wrapper_.classList.add('separator');
};

/**
 * Set the tweet shortened links hash
 * @param {Object.<string, string>} linksHash Links hash
 */
twic.vcl.Tweet.prototype.setLinks = function(linksHash) {
	this.links_ = linksHash;
};

/**
 * Set retweeter info
 * @param {number} id Retweet author identifier
 * @param {string} nick Retweet author nick
 * @param {string} av User avatar src
 */
twic.vcl.Tweet.prototype.setRetweeter = function(id, nick, av) {
	this.retweetedById_ = id;

	if (this.retweetedById_ === this.timelineId_) {
		this.wrapper_.classList.add('me');
	}

	this.rtAvatarLink_.title = twic.utils.lang.translate('title_retweeted_by', '@' + nick);
	this.rtAvatarLink_.href = '#profile#' + nick;

	this.rtAvatar_.src = av;

	this.rtAvatarLink_.style.display = 'block';

	this.wrapper_.classList.add('retweet');
};

/**
 * Set author info
 * @param {number} id Author identifier
 * @param {string} nick Tweet author nick
 * @param {string} av User avatar src
 */
twic.vcl.Tweet.prototype.setAuthor = function(id, nick, av) {
	this.authorId_ = id;
	this.authorNick_ = nick;

	if (this.authorId_ === this.timelineId_) {
		this.wrapper_.classList.add('me');
	}

	// FIXME holy shit!
	if (this.timeLink_) {
		this.timeLink_.setAttribute('href', 'https://twitter.com/#!/' + nick + '/status/' + this.id_);
		this.timeLink_.setAttribute('target', '_blank');
	}

	this.avatarLink_.title = '@' + nick;
	this.avatarLink_.href = '#profile#' + nick;

	this.avatar_.src = av;
};

twic.vcl.Tweet.prototype.getCanConversation = function() {
	return '' !== this.replyTo_;
};

/**
 * Can reply to tweet?
 * @return {!boolean}
 */
twic.vcl.Tweet.prototype.getCanReply = function() {
	return true;
};

/**
 * Get the tweet element
 * @return {Element}
 */
twic.vcl.Tweet.prototype.getElement = function() {
	return this.wrapper_;
};

/**
 * Get the tweet raw text
 * @return {string}
 */
twic.vcl.Tweet.prototype.getRawText = function() {
	return this.rawText_;
};

/**
 * Tweet id
 * @return {string}
 */
twic.vcl.Tweet.prototype.getId = function() {
	return this.id_;
};

/**
 * Is replying?
 * @returns {boolean}
 */
twic.vcl.Tweet.prototype.isReplying = function() {
	return null !== this.replier_;
};

/**
 * Inner reset the tweet replier
 * @private
 */
twic.vcl.Tweet.prototype.resetTweetEditor_ = function() {
	this.wrapper_.classList.remove('replying');
	this.replier_ = null;
};

/**
 * Reset the tweet replier
 */
twic.vcl.Tweet.prototype.resetEditor = function() {
	if (this.isReplying()) {
		this.replier_.close();
		this.resetTweetEditor_();
	}
};

/**
 * Can retweet?
 * @returns {boolean}
 */
twic.vcl.Tweet.prototype.getCanRetweet = function() {
	return !this.isProtected_
		&& this.authorId_ !== this.timelineId_
		&& this.retweetedById_ !== this.timelineId_;
};

/**
 * Can unretweet?
 * @returns {boolean}
 */
twic.vcl.Tweet.prototype.getCanUnRetweet = function() {
	return this.retweetedById_ === this.timelineId_;
};

/**
 * Can delete?
 * @returns {boolean}
 */
twic.vcl.Tweet.prototype.getCanDelete = function() {
	return this.authorId_ === this.timelineId_;
};

twic.vcl.Tweet.prototype.resetExtraInfo_ = function() {
	if (this.mapVisible_) {
		this.toggleMap_();
	}

	if (this.galleryVisible_) {
		this.toggleGallery_();
	}
};

/**
 * Toggle the map
 */
twic.vcl.Tweet.prototype.toggleMap_ = function() {
	var
		tweet = this;

	if (!this.mapVisible_) {
		this.resetExtraInfo_();

		tweet.onMapShow.call(tweet);

		twic.dom.addClass(this.wrapper_, 'map');
	} else {
		twic.dom.removeClass(this.wrapper_, 'map');
	}

	if (!this.infoMap_) {
		this.infoMap_ = twic.dom.expandElement('div.map');
		this.infoWrapper_.appendChild(this.infoMap_);

		this.map_ = new twic.vcl.Map(this.infoMap_, this.geo_[0], this.geo_[1]);
	}

	this.mapVisible_ = !this.mapVisible_;
};

/**
 * Toggle the preview image
 */
twic.vcl.Tweet.prototype.toggleGallery_ = function() {
	var
		tweet = this;

	if (!this.infoGallery_) {
		var
			img = twic.dom.expandElement('img'),
			imgLink = twic.dom.expandElement('a'),
			imageInfo = this.images_[0];

		img.setAttribute('src', imageInfo[0]);

		imgLink.setAttribute('href', imageInfo[1]);
		imgLink.setAttribute('target', '_blank');
		imgLink.appendChild(img);

		this.infoGallery_ = twic.dom.expandElement('div.gallery');
		this.infoGallery_.appendChild(imgLink);

		this.infoWrapper_.appendChild(this.infoGallery_);
	}

	if (!this.galleryVisible_) {
		this.resetExtraInfo_();

		tweet.onGalleryShow.call(tweet);

		twic.dom.addClass(this.wrapper_, 'gallery');
	} else {
		twic.dom.removeClass(this.wrapper_, 'gallery');
	}

	this.galleryVisible_ = !this.galleryVisible_;
};

/**
 * Reply the tweet
 * @param {boolean=} all Reply to all mentioned
 */
twic.vcl.Tweet.prototype.reply = function(all) {
	var
		tweet = this,
		/** @type {string} **/ replyNick = this.authorNick_,
		/** @type {string} **/ nickList = '@' + replyNick + ' ';

	if (all) {
		var
			/** @type {string} **/ nick = '',
			nicks = this.mentioned_;

		if (replyNick.toLowerCase() in nicks) {
			delete nicks[replyNick.toLowerCase()];
		}

		for (nick in nicks) {
			nickList += nicks[nick] + ' ';
		}
	}

	this.replier_ = new twic.vcl.TweetEditor(this.timelineId_, this.replyWrapper_, this.id_);
	this.replier_.toggleGeo(this.timeline_.geoEnabled);
	this.replier_.autoRemovable = true;
	this.replier_.setConstTextIfEmpty(nickList);
	this.replier_.setFocus();

	this.replier_.onTweetSend = function(editor, tweetObj, replyTo, callback) {
		tweet.onReplySend.call(tweet, editor, tweetObj, replyTo, callback);
	};

	this.replier_.onClose = function() {
		tweet.resetTweetEditor_.call(tweet);
	};

	this.replier_.onGetSuggestList = function(startPart, callback) {
		tweet.timeline_.onReplierGetSuggestList.call(tweet.replier_, startPart, callback);
	};

	this.wrapper_.classList.add('replying');

	this.resetExtraInfo_();
};

/**
 * Set the source
 * @param {string} newSource Tweet source (client)
 */
twic.vcl.Tweet.prototype.setSource = function(newSource) {
	var
		clientSpan = twic.dom.expandElement('span.client');

	clientSpan.innerHTML = (0 !== this.unixtime_ ? ' ' + twic.utils.lang.translate('via') + ' ' : '') +
		newSource.replace('<a ', '<a target="_blank" ') + '<br />';
	this.otherInfo_.appendChild(clientSpan);
};

/**
 * Set geo info
 * @param {Array} info Geo info
 */
twic.vcl.Tweet.prototype.setGeo = function(info) {
	var
		tweet = this,
		markerSpan = twic.dom.expandElement('span.button.geo');

	markerSpan.innerHTML = '&nbsp;&nbsp;';

	markerSpan.addEventListener('click', function(e) {
		tweet.toggleMap_.call(tweet);
	}, false);

	this.geo_ = info;

	twic.dom.insertFirst(this.otherInfo_, markerSpan);
};

/**
 * Set image info
 * @param {Array.<string>} previews Preview urls
 */
twic.vcl.Tweet.prototype.setImages = function(previews) {
	var
		tweet = this,
		previewSpan = twic.dom.expandElement('span.button.img');

	this.images_ = previews;

	previewSpan.innerHTML = '&nbsp;&nbsp;';

	previewSpan.addEventListener('click', function(e) {
		tweet.toggleGallery_.call(tweet);
	}, false );

	twic.dom.insertFirst(this.otherInfo_, previewSpan);
};

/**
 * Handler for tweet send process
 * @param {twic.vcl.TweetEditor} editor Editor
 * @param {twic.cobj.Tweet} tweet Tweet common object
 * @param {string=} replyTo Reply to tweet
 * @param {function()=} callback Callback
 */
twic.vcl.Tweet.prototype.onReplySend = function(editor, tweet, replyTo, callback) { };

/**
 * Handler for the tweet map show
 */
twic.vcl.Tweet.prototype.onMapShow = function() { };

/**
 * Handler for the tweet gallery show
 */
twic.vcl.Tweet.prototype.onGalleryShow = function() { };
