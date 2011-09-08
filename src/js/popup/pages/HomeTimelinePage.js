/**
 * Home timeline implementation
 *
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

/**
 * @constructor
 * @extends twic.pages.TimelinePage
 */
twic.pages.HomeTimelinePage = function() {
	twic.pages.TimelinePage.call(this);

	this.remember = true;

	/**
	 * @type {Element}
	 * @private
	 */
	this.page_ = null;

	/**
	 * @type {Element}
	 * @private
	 */
	this.accountNameElement_ = null;

	/**
	 * @type {Element}
	 * @private
	 */
	this.newTweet_ = null;

	/**
	 * @type {twic.vcl.TweetEditor}
	 * @private
	 */
	this.tweetEditor_ = null;

	/**
	 * @type {number}
	 * @private
	 */
	this.userId_ = 0;
};

goog.inherits(twic.pages.HomeTimelinePage, twic.pages.TimelinePage);

/**
 * Update the timeline from the top
 * @private
 */
twic.pages.HomeTimelinePage.prototype.updateTop_ = function() {
	var
		page = this;

	if (page.timeline_.beginUpdate(false, true)) {
		twic.requests.makeRequest('getTimeline', {
			'id': page.userId_,
			'after': page.timeline_.getLastTweetId()
		}, function(data) {
			page.buildList_.call(page, data);
		} );
	}
};

/**
 * Update the timeline from the bottom
 * @private
 */
twic.pages.HomeTimelinePage.prototype.updateBottom_ = function() {
	var
		page = this,
		firstId = page.timeline_.getFirstTweetId();

	if (firstId.id === page.cachedFirstId_) {
		return false;
	}

	if (page.timeline_.beginUpdate(true, true)) {
		twic.requests.makeRequest('getTimeline', {
			'id': page.userId_,
			'before': firstId
		}, function(data) {
			page.cachedFirstId_ = firstId.id;

			page.buildList_.call(page, data);
		} );
	}
};

/**
 * @private
 * @param {string} text
 */
twic.pages.HomeTimelinePage.prototype.doOldRetweet_ = function(text) {
	this.tweetEditor_.setText(text);
	this.tweetEditor_.setFocus(true);
};

/**
 * @private
 */
twic.pages.HomeTimelinePage.prototype.update_ = function() {
	var
		page = this;

	page.timeline_.clear();

	page.timeline_.beginUpdate();

	// todo thank about smarter way to refresh the timeline
	twic.requests.makeRequest('getTimeline', {
		'id': page.userId_
	}, function(data) {
		page.buildList_.call(page, data);
	} );
 };

/**
 * @private
 * @param {twic.vcl.TweetEditor} editor
 * @param {twic.cobj.Tweet} tweet Tweet common object
 * @param {string} replyId
 * @param {function()} callback
 */
twic.pages.HomeTimelinePage.prototype.tweetHandler_ = function(editor, tweet, replyId, callback) {
	var
		page = this,
		coords = tweet.coords.enabled ? [tweet.coords.lat, tweet.coords.lng] : false;

	var finish = function() {
		callback();
		page.updateTop_.call(page);
	};

	if (replyId) {
		twic.requests.makeRequest('replyTweet', {
			'id': page.userId_,
			'tweet': tweet.text,
			'coords': coords,
			'replyTo': replyId
		}, finish);
	} else {
		twic.requests.makeRequest('sendTweet', {
			'id': page.userId_,
			'tweet': tweet.text,
			'coords': coords
		}, finish);
	}
};

twic.pages.HomeTimelinePage.prototype.initOnce = function() {
	var
		page = this;

	twic.pages.TimelinePage.prototype.initOnce.call(page);

	page.timeline_.onOldRetweet = function(text) {
		page.doOldRetweet_.call(page, text);
	};

	page.accountNameElement_ = twic.dom.findElement('.toolbar p', page.page_);

	page.newTweet_ = twic.dom.findElement('.newtweet', page.page_);

	twic.dom.findElement('.toolbar a', page.page_).innerHTML = twic.utils.lang.translate('toolbar_accounts');
};

twic.pages.HomeTimelinePage.prototype.handle = function(data) {
	var
		page = this,
		userId = parseInt(data[0], 10);

	twic.Page.prototype.handle.call(page, data);

	if (
		!data.length
		|| 1 !== data.length
	) {
		window.location.hash = '#accounts';
		return;
	}

	page.accountNameElement_.innerHTML = '';

	page.userId_ = userId;

	page.newTweet_.innerHTML = '';

	page.tweetEditor_ = new twic.vcl.TweetEditor(this.userId_, this.newTweet_);
	twic.requests.makeRequest('getUserInfo', {
		'id': userId
	}, function(info) {
		var
			geoEnabled = 1 == info['geo_enabled'];

		page.timeline_.geoEnabled = geoEnabled;
		page.tweetEditor_.toggleGeo(geoEnabled);
	} );

	page.tweetEditor_.onFocus = function() {
		page.timelineResetEditor_.call(page);
	};
	page.tweetEditor_.onTweetSend = function(editor, tweet, replyId, callback) {
		page.tweetHandler_.call(page, editor, tweet, replyId, callback);
	};
	page.tweetEditor_.onGetSuggestList = function(startPart, callback) {
		page.getSuggestList_.call(page, startPart, callback);
	};

	page.update_();
};
