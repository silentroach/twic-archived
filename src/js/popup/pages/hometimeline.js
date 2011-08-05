/**
 * Home timeline implementation
 *
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

/**
 * @constructor
 * @extends twic.Page
 */
twic.pages.TimelinePage = function() {
	twic.Page.call(this);
	
	this.remember = true;
	
	/** 
	 * @type {twic.vcl.Timeline}
	 * @private
	 */ 
	this.timeline_ = null;
	
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

goog.inherits(twic.pages.TimelinePage, twic.Page);

/**
 * @private
 */
twic.pages.TimelinePage.prototype.buildList_ = function(info) {
	var
		id       = null,
		userName = info['account']['name'],
		data     = info['data'];

	this.accountNameElement_.innerHTML = '@' + userName;

	this.timeline_.setUserId(info['account']['id']);
	this.timeline_.setUserNick(userName);

	for (id in data) {
		var
			item      = data[id],
			user      = item['user'],
			retweeted = item['retweeted'],
			tweet     = this.timeline_.addTweet(id);

		if (retweeted) {
			tweet.setAuthor(retweeted['id'], retweeted['screen_name'], retweeted['avatar']);
			tweet.setRetweeter(user['id'], user['screen_name'], user['avatar']);

			// todo refactor with bottom
			if (retweeted['is_protected']) {
				tweet.setProtected();
			}
		} else {
			tweet.setAuthor(user['id'], user['screen_name'], user['avatar']);

			if (user['is_protected']) {
				tweet.setProtected();
			}
		}

		if (item['separator']) {
			tweet.setSeparator();
		}

		if ('dt' in item) {
			tweet.setUnixTime(item['dt']);
		}

		if ('source' in item) {
			tweet.setSource(item['source']);
		}

		if (
			'links' in item
			&& item['links'].length > 0
		) {
			tweet.setLinks(item['links']);
		}

		tweet.setText(item['msg']);
	}

	this.timeline_.endUpdate();
};

/**
 * @private
 */
twic.pages.TimelinePage.prototype.updateTop_ = function() {
	var
		page = this;
	
	page.timeline_.beginUpdate(false, true);

	twic.requests.makeRequest('getTimeline', {
		'id': page.userId_,
		'after': page.timeline_.getLastId()
	}, function(data) {
		page.buildList_.call(page, data);
	} );
};

/**
 * @private
 * @param {string} text
 */
twic.pages.TimelinePage.prototype.doOldRetweet_ = function(text) {
	this.tweetEditor_.setText(text);
	this.tweetEditor_.setFocus(true);
};

/**
 * @private
 * @param {number} userId
 * @param {string} tweetId
 * @param {function()} callback
 */
twic.pages.TimelinePage.prototype.doRetweet_ = function(userId, tweetId, callback) {
	var
		page = this;
	
	twic.requests.makeRequest('retweet', {
		'userId': userId,
		'tweetId': tweetId
	}, function() {
		callback();

		page.tweetEditor_.reset();
		page.updateTop_();
	} );
};

/**
 * @private
 * @param {number} userId
 * @param {string} tweetId
 * @param {function()} callback
 */
twic.pages.TimelinePage.prototype.doDelete_ = function(userId, tweetId, callback) {
	var
		page = this;
	
	twic.requests.makeRequest('delete', {
		'userId': userId,
		'tweetId': tweetId
	}, function() {
		callback();

		page.tweetEditor_.reset();
		page.update_();
	} );
};

/**
 * @private
 */
twic.pages.TimelinePage.prototype.update_ = function() {
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
 * @param {string} tweetText
 * @param {string} replyId
 * @param {function()} callback
 */
twic.pages.TimelinePage.prototype.tweetHandler_ = function(editor, tweetText, replyId, callback) {
	var
		page = this;
	
	var finish = function() {
		callback();
		page.updateTop.call(page);
	};

	if (replyId) {
		twic.requests.makeRequest('replyTweet', {
			'id': page.userId_,
			'tweet': tweetText,
			'replyTo': replyId
		}, finish);
	} else {
		twic.requests.makeRequest('sendTweet', {
			'id': page.userId_,
			'tweet': tweetText
		}, finish);
	}
};

/**
 * @private
 */
twic.pages.TimelinePage.prototype.timelineResetEditor_ = function() {
	this.timeline_.resetEditor();
};

/**
 * Suggest list builder
 * @param {string} startPart Nick start part
 * @param {function(Array<string>)} callback Callback function
 */
twic.pages.TimelinePage.prototype.getSuggestList_ = function(startPart, callback) {
	twic.requests.makeRequest( 'getNickSuggest', {
		'nickPart': startPart
	}, callback );
};

twic.pages.TimelinePage.prototype.initOnce = function() {
	var
		page = this;
	
	twic.Page.prototype.initOnce.call(page);
	
	page.page_ = twic.dom.findElement('#timeline');
	page.accountNameElement_ = twic.dom.findElement('.toolbar p', page.page_);

	page.timeline_ = new twic.vcl.Timeline(page.page_);
	page.timeline_.onReplySend = function(editor, tweetText, replyId, callback) {
		page.tweetHandler_.call(page, editor, tweetText, replyId, callback);
	};
	page.timeline_.onRetweet = function(userId, tweetId, callback) {
		page.doRetweet_.call(page, userId, tweetId, callback);
	};
	page.timeline_.onOldRetweet = function(text) {
		page.doOldRetweet_.call(page, text);
	};
	page.timeline_.onDelete  = function(userId, tweetId, callback) {
		page.doDelete_.call(page, userId, tweetId, callback);
	};
	page.timeline_.onReplierGetSuggestList = function(startPart, callback) {
		page.getSuggestList_.call(page, startPart, callback);
	};

	page.newTweet_ = twic.dom.findElement('.newtweet', page.page_);

	twic.dom.findElement('.toolbar a', page.page_).innerHTML = twic.utils.lang.translate('toolbar_accounts');
};

twic.pages.TimelinePage.prototype.handle = function(data) {
	var
		page = this;
	
	twic.Page.prototype.handle.call(page);
	
	if (
		!data.length
		|| 1 !== data.length
	) {
		window.location.hash = '#accounts';
		return;
	}

	page.accountNameElement_.innerHTML = '';

	page.userId_ = parseInt(data[0], 10);

	page.newTweet_.innerHTML = '';

	page.tweetEditor_ = new twic.vcl.TweetEditor(this.userId_, this.newTweet_);
	page.tweetEditor_.onFocus = function() {
		page.timelineResetEditor_.call(page);
	};
	page.tweetEditor_.onTweetSend = function(editor, tweetText, replyId, callback) {
		page.tweetHandler_.call(page, editor, tweetText, replyId, callback);
	};
	page.tweetEditor_.onGetSuggestList = function(startPart, callback) {
		page.getSuggestList_.call(page, startPart, callback);
	};

	page.update_();
};

twic.router.register('timeline', twic.pages.TimelinePage);
