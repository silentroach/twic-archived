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
    var
        page = this;

    twic.pages.TimelinePage.call(page);

    page.remember = true;

    page.getMethod_ = 'getTimeline';

    /**
     * @type {Element}
     * @private
     */
    page.newTweet_ = null;
};

goog.inherits(twic.pages.HomeTimelinePage, twic.pages.TimelinePage);

/**
 * @private
 * @param {string} text
 */
twic.pages.HomeTimelinePage.prototype.doOldRetweet_ = function(text) {
    this.tweetEditor_.setText(text);
    this.tweetEditor_.setFocus(true);
};

twic.pages.HomeTimelinePage.prototype.initOnce = function() {
    var
        page = this;

    page.pageElement_ = twic.dom.findElement('#timeline');

    twic.pages.TimelinePage.prototype.initOnce.call(page);

    page.timeline_.onOldRetweet = function(text) {
        page.doOldRetweet_.call(page, text);
    };

    page.elementDirect_       = twic.dom.findElement('.toolbar p a', page.pageElement_);
    page.elementDirect_.title = twic.i18n.translate('title_directly');
    page.directLinkBase_      = page.elementDirect_.href;
    page.accountNameElement_  = twic.dom.findElement('.toolbar p span', page.pageElement_);

    page.newTweet_ = twic.dom.findElement('.newtweet', page.pageElement_);

    twic.dom.findElement('.toolbar a', page.pageElement_).innerHTML = twic.i18n.translate('toolbar_accounts');
};

twic.pages.HomeTimelinePage.prototype.handle = function(data) {
    var
        page = this,
        userId = parseInt(data[0], 10);

    twic.Page.prototype.handle.call(page, data);

    if (!data.length
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

    page.tweetEditor_.addEventListener('focus', function() {
        page.timelineResetEditor_.call(page);
    } );

    page.tweetEditor_.onTweetSend = function(editor, tweet, replyId, callback) {
        page.tweetHandler_.call(page, editor, tweet, replyId, callback);
    };
    page.tweetEditor_.onGetSuggestList = function(startPart, callback) {
        page.getSuggestList_.call(page, userId, startPart, callback);
    };

    page.update_();
};
