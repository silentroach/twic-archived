/**
 * Page with timeline implementation
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

    /**
     * @type {twic.vcl.Timeline}
     * @protected
     */
    this.timeline_ = null;

    /**
     * @type {string}
     * @private
     */
    this.cachedFirstId_ = '';

    /**
     * @type {Element}
     * @protected
     */
    this.accountNameElement_ = null;

    /**
     * @type {Element}
     * @protected
     */
    this.elementDirect_ = null;

    /**
     * @type {string}
     * @protected
     */
    this.directLinkBase_ = '';

    /**
     * @type {twic.vcl.TweetEditor}
     * @protected
     */
    this.tweetEditor_ = null;

    /**
     * @type {string}
     * @protected
     */
    this.getMethod_ = '';

    /**
     * @type {number}
     * @protected
     */
    this.userId_ = 0;

    /**
     * @type {boolean}
     * @private
     */
    this.updating_ = false;

};

goog.inherits(twic.pages.TimelinePage, twic.Page);

/**
 * @protected
 */
twic.pages.TimelinePage.prototype.buildList_ = function(info) {
    var
        id       = null,
        userName = info['account']['name'],
        data     = info['data'];

    // this.accountNameElement_.innerHTML = '@' + userName;
    // this.elementDirect_.href = this.directLinkBase_ + userName;

    this.timeline_.setUserId(info['account']['id']);
    this.timeline_.setUserNick(userName);

    for (id in data) {
        var
            item      = data[id],
            user      = item['user'],
            retweeted = item['retweeted'],
            tweet     = this.timeline_.addTweet(id, item['dt']);

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

        if ('reply_to' in item) {
            tweet.setReplyTo(item['reply_to']);
        }

        if (item['separator']) {
            tweet.setSeparator();
        }

        if ('geo' in item) {
            tweet.setGeo(item['geo']);
        }

        if ('source' in item) {
            tweet.setSource(item['source']);
        }

        if ('links' in item
            && item['links'].length > 0
        ) {
            tweet.setLinks(item['links']);
        }

        if ('media' in item
            && item['media'].length > 0
        ) {
            tweet.setImages(item['media']);
        }

        tweet.setText(item['msg']);
    }

    this.timeline_.endUpdate();
};

/**
 * Update the timeline from the top
 * @protected
 */
twic.pages.TimelinePage.prototype.updateTop_ = function() {
    var
        page = this;

    if (page.updating_) {
        return false;
    }

    if (page.timeline_.beginUpdate(false, true)) {
        page.updating_ = true;

        twic.requests.makeRequest(page.getMethod_, {
            'id': page.userId_,
            'after': page.timeline_.getLastTweetId()
        }, function(data) {
            page.buildList_.call(page, data);

            page.updating_ = false;
        } );
    }
};

/**
 * Update the timeline from the bottom
 * @protected
 */
twic.pages.TimelinePage.prototype.updateBottom_ = function() {
    var
        page = this,
        firstId = page.timeline_.getFirstTweetId();

    if (page.updating_
        || firstId.id === page.cachedFirstId_
    ) {
        return false;
    }

    if (page.timeline_.beginUpdate(true, true)) {
        page.updating_ = true;

        twic.requests.makeRequest(page.getMethod_, {
            'id': page.userId_,
            'before': firstId
        }, function(data) {
            page.cachedFirstId_ = firstId.id;

            page.buildList_.call(page, data);

            page.updating_ = false;
        } );
    }
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
 * @protected
 */
twic.pages.TimelinePage.prototype.update_ = function() {
    var
        page = this;

    page.timeline_.clear();

    page.timeline_.beginUpdate();

    // todo thank about smarter way to refresh the timeline
    twic.requests.makeRequest(page.getMethod_, {
        'id': page.userId_
    }, function(data) {
        page.buildList_.call(page, data);
    } );
 };

/**
 * @protected
 * @param {twic.vcl.TweetEditor} editor
 * @param {twic.cobj.Tweet} tweet Tweet common object
 * @param {string} replyId
 * @param {function()} callback
 */
twic.pages.TimelinePage.prototype.tweetHandler_ = function(editor, tweet, replyId, callback) {
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

/**
 * @protected
 */
twic.pages.TimelinePage.prototype.timelineResetEditor_ = function() {
    this.timeline_.resetEditor();
};

/**
 * Suggest list builder
 * @param {number} userId User id
 * @param {string} startPart Nick start part
 * @param {function(Array.<string>)} callback Callback function
 */
twic.pages.TimelinePage.prototype.getSuggestList_ = function(userId, startPart, callback) {
    twic.requests.makeRequest('getNickSuggest', {
        'userId':   userId,
        'nickPart': startPart
    }, callback);
};

/**
 * Handler for the scroll event
 */
twic.pages.TimelinePage.prototype.scrollHandler_ = function(e) {
    if (document.body.scrollHeight - window.innerHeight - document.body.scrollTop < 150) {
        this.updateBottom_();
    }
};

twic.pages.TimelinePage.prototype.initOnce = function() {
    var
        page = this;

    twic.Page.prototype.initOnce.call(page);

    window.addEventListener('scroll', function(e) {
        page.scrollHandler_.call(page, e);
    }, false);

    page.timeline_ = new twic.vcl.Timeline(page.pageElement_);
    page.timeline_.onReplySend = function(editor, tweet, replyId, callback) {
        page.tweetHandler_.call(page, editor, tweet, replyId, callback);
    };
    page.timeline_.onRetweet = function(userId, tweetId, callback) {
        page.doRetweet_.call(page, userId, tweetId, callback);
    };
    page.timeline_.onDelete  = function(userId, tweetId, callback) {
        page.doDelete_.call(page, userId, tweetId, callback);
    };
    page.timeline_.onReplierGetSuggestList = function(startPart, callback) {
        page.getSuggestList_.call(page, page.userId_, startPart, callback);
    };
};

twic.pages.TimelinePage.prototype.handle = function(data) {
    twic.Page.prototype.handle.call(this, data);
};
