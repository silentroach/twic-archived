/**
 * Profile page implementation
 *
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

/**
 * @constructor
 * @extends twic.Page
 */
twic.pages.ProfilePage = function() {
    var
        page = this;

    twic.Page.call(page);

    /**
     * @type {boolean}
     * @private
     */
    page.isOverUnfollow_ = false;

    /**
     * @type {Element}
     * @private
     */
    page.containerInfo_ = null;

    /**
     * @type {Element}
     * @private
     */
    page.containerError_ = null;

    /**
     * @type {Element}
     * @private
     */
    page.elementLoader_ = null;

    /**
     * @type {Element}
     * @private
     */
    page.elementAvatar_ = null;

    /**
     * @type {Element}
     * @private
     */
    page.elementName_ = null;

    /**
     * @type {Element}
     * @private
     */
    page.elementNick_ = null;

    /**
     * @type {Element}
     * @private
     */
    page.elementUrl_ = null;

    /**
     * @type {Element}
     * @private
     */
    page.elementBio_ = null;

    /**
     * @type {Element}
     * @private
     */
    page.elementLocation_ = null;

    /**
     * @type {Element}
     * @private
     */
    page.elementFollowings_ = null;

    /**
     * @type {Element}
     * @private
     */
    page.elementFollowed_ = null;

    /**
     * @type {Element}
     * @private
     */
    page.elementFollowedSpan_ = null;

    /**
     * @type {Element}
     * @private
     */
    // page.elementDirect_ = null;

    /**
     * @type {Element}
     * @private
     */
    page.elementProps_ = null;

    /**
     * @type {Element}
     * @private
     */
    page.elementStats_ = null;

    /**
     * @type {Element}
     * @private
     */
    page.elementStatsTweets_ = null;

    /**
     * @type {Element}
     * @private
     */
    page.elementStatsFollowers_ = null;

    /**
     * @type {Element}
     * @private
     */
    page.elementStatsFollowings_ = null;

    /**
     * @type {number}
     * @private
     */
    page.timelineUserId = 0;

    /**
     * @type {number}
     * @private
     */
    page.profileUserId = 0;

    /**
     * @type {Element}
     * @private
     */
    page.toolbarTimeline_ = null;

    /**
     * @type {string}
     * @private
     */
    page.directLinkBase_ = '';
};

goog.inherits(twic.pages.ProfilePage, twic.Page);

/**
 * @type {RegExp}
 * @const
 */
twic.pages.ProfilePage.REGEXP_COORDS = /(-?\d+\.\d+),(-?\d+\.\d+)/;

twic.pages.ProfilePage.prototype.initOnce = function() {
    var
        page = this;

    page.pageElement_ = twic.dom.findElement('#profile');

    twic.Page.prototype.initOnce.call(page);

    page.containerInfo_  = twic.dom.findElement('.info',  page.pageElement_);
    page.containerError_ = twic.dom.findElement('.error', page.pageElement_);

    page.containerError_.innerHTML = twic.i18n.translate('error_user_not_found');
    twic.dom.hide(page.containerError_);

    page.elementFollowings_   = twic.dom.findElement('#followings');
    page.elementFollowed_     = twic.dom.findElement('p',    page.elementFollowings_);
    page.elementFollowedSpan_ = twic.dom.findElement('span', page.elementFollowings_);

    // page.elementDirect_       = twic.dom.findElement('.toolbar p a', page.pageElement_);
    // page.elementDirect_.title = twic.i18n.translate('title_directly');
    // page.directLinkBase_      = page.elementDirect_.href;

    page.elementLoader_   = twic.dom.findElement('.loader', page.pageElement_);
    page.elementAvatar_   = twic.dom.findElement('.avatar', page.pageElement_);
    page.elementName_     = twic.dom.findElement('.name',   page.pageElement_);
    page.elementNick_     = twic.dom.findElement('.nick', page.pageElement_);
    page.elementUrl_      = twic.dom.findElement('.url', page.pageElement_);
    page.elementBio_      = twic.dom.findElement('.bio', page.pageElement_);
    page.elementLocation_ = twic.dom.findElement('.location',  page.pageElement_);

    page.elementStats_    = twic.dom.findElement('.stats', page.pageElement_);

    page.elementStatsTweets_     = twic.dom.findElement('.stats-tweets', page.elementStats_);
    page.elementStatsFollowers_  = twic.dom.findElement('.stats-followers', page.elementStats_);
    page.elementStatsFollowings_ = twic.dom.findElement('.stats-following', page.elementStats_);

    twic.dom.findElement('.stats-tweets-i18n').innerHTML    = twic.i18n.translate('title_tweets');
    twic.dom.findElement('.stats-following-i18n').innerHTML = twic.i18n.translate('title_following');
    twic.dom.findElement('.stats-followers-i18n').innerHTML = twic.i18n.translate('title_followers');

    // page.toolbarTimeline_ = twic.dom.findElement('.toolbar a', page.pageElement_);

    page.elementProps_ = twic.dom.findElement('.props', page.pageElement_);

    twic.dom.findElement('.protected', page.elementProps_).title = twic.i18n.translate('title_protected');
};

/**
 * Clear the profile data
 * @private
 */
twic.pages.ProfilePage.prototype.clearData_ = function() {
    var
        page = this;

    twic.dom.show(page.elementLoader_);

    twic.dom.hide(page.elementAvatar_);
    twic.dom.hide(page.elementFollowings_);
    twic.dom.hide(page.elementBio_);
    twic.dom.hide(page.elementLocation_);
    twic.dom.hide(page.elementStats_);

    page.elementFollowedSpan_.className = '';
    page.elementFollowed_.className = '';
    page.elementAvatar_.src = '';
    twic.dom.addClass(page.elementProps_, 'props');
    page.elementName_.innerHTML = '';
    page.elementNick_.innerHTML = '';
    page.elementFollowedSpan_.innerHTML = '';
};

/**
 * Follow user
 * @private
 */
twic.pages.ProfilePage.prototype.follow_ = function() {
    var
        page = this;

    page.elementFollowedSpan_.className = 'loading';

    twic.requests.makeRequest('follow', {
        'id': page.timelineUserId_,
        'whom_id': page.profileUserId_
    }, function() {
        page.showProfileFriendship_(true);
    } );
};

/**
 * Unfollow user
 * @private
 */
twic.pages.ProfilePage.prototype.unfollow_ = function() {
    var
        page = this;

    page.elementFollowedSpan_.className = 'loading';

    twic.requests.makeRequest('unfollow', {
        'id': page.timelineUserId_,
        'whom_id': page.profileUserId_
    }, function() {
        page.showProfileFriendship_(false);
    } );
};

/**
 * Show the user membership
 * @param {boolean} following Following user?
 * @private
 */
twic.pages.ProfilePage.prototype.showProfileFriendship_ = function(following) {
    var
        page = this;

    page.elementFollowedSpan_.className = '';

    if (following) {
        page.elementFollowed_.className = 'following';
        page.elementFollowedSpan_.innerHTML = twic.i18n.translate('button_following');

        page.elementFollowed_.onclick = function() {
            page.unfollow_.call(page);
        };

        page.elementFollowed_.onmouseover = function() {
            page.onFollowedMouseOver_.call(page);
        };

        page.elementFollowed_.onmouseout = function() {
            page.onFollowedMouseOut_.call(page);
        };
    } else {
        page.elementFollowed_.className = '';
        page.elementFollowedSpan_.innerHTML = twic.i18n.translate('button_follow');

        page.elementFollowed_.onmouseover = null;
        page.elementFollowed_.onmouseout = null;
        page.elementFollowed_.onclick = function() {
            page.follow_.call(page);
        };
    }

    twic.dom.show(page.elementFollowings_);
};

/**
 * @private
 */
twic.pages.ProfilePage.prototype.onFollowedMouseOver_ = function() {
    if (!this.isOverUnfollow_) {
        this.isOverUnfollow_ = true;
        this.elementFollowedSpan_.innerHTML = twic.i18n.translate('button_unfollow');
    }
};

/**
 * @private
 */
twic.pages.ProfilePage.prototype.onFollowedMouseOut_ = function() {
    if (this.isOverUnfollow_) {
        this.isOverUnfollow_ = false;
        this.elementFollowedSpan_.innerHTML = twic.i18n.translate('button_following');
    }
};

/**
 * @private
 * @param {Object=} data
 */
twic.pages.ProfilePage.prototype.showProfile_ = function(data) {
    var
        page = this;

    twic.dom.toggle(page.containerInfo_, !!data);
    twic.dom.toggle(page.containerError_, !data);

    if (data) {
        var
            /** @type {Element} **/ marginElement = null,
            /** @type {boolean} **/ marginUnderBio = false,
            /** @type {string} **/  description = data['description'],
            /** @type {string} **/  loc = data['location'];

        page.profileUserId_ = data['id'];

        // fixme shitcode
        page.elementAvatar_.src = data['avatar'].replace('_normal.', '_bigger.');
        page.elementAvatar_.title = '@' + data['screen_name'];
        twic.dom.show(page.elementAvatar_);

        // user properties
        if (data['is_protected']) {
            twic.dom.addClass(page.elementProps_, 'protected');
        }

        page.elementName_.innerHTML = data['name'];
        page.elementNick_.innerHTML = '@' + data['screen_name'];

        // page.elementDirect_.href = page.directLinkBase_ + data['screen_name'];

        // site
        if (data['url'] !== '') {
            marginUnderBio = true;

            page.elementUrl_.innerHTML = twic.utils.url.humanize(data['url']);
            marginElement = page.elementUrl_;

            twic.dom.show(page.elementUrl_);
        }

        // location
        if (loc.trim() !== '') {
            marginUnderBio = true;

            page.elementLocation_.innerHTML = loc;
            marginElement = page.elementLocation_;

            twic.dom.show(page.elementLocation_);
        }

        // bio
        if (description.trim() !== '') {
            page.elementBio_.innerHTML = twic.utils.url.processText(description);
            marginElement = page.elementBio_;

            if (marginUnderBio) {
                page.elementBio_.style.marginBottom = '1em';
            }

            twic.dom.show(page.elementBio_);
        }

        if (marginElement) {
            marginElement.style.marginTop = '1em';
        }

        page.elementStatsTweets_.innerHTML     = data['statuses_count'];
        page.elementStatsFollowers_.innerHTML  = data['followers_count'];
        page.elementStatsFollowings_.innerHTML = data['friends_count'];

        twic.dom.show(page.elementStats_);

        if (!page.timelineUserId_
            || page.timelineUserId_ === data['id']
        ) {
            twic.dom.hide(page.elementLoader_);
        } else {
            twic.requests.makeRequest('getProfileFriendshipInfo', {
                'source_id': page.timelineUserId_,
                'target_id': data['id']
            }, function(data) {
                twic.dom.hide(page.elementLoader_);
                twic.dom.show(page.elementFollowings_);

                page.showProfileFriendship_(data['following']);
            } );
        }
    }
};

twic.pages.ProfilePage.prototype.handle = function(data) {
    twic.Page.prototype.handle.call(this, data);

    var
        page = this,
        prev = twic.router.previous(),
        /** @type {string} **/ prevPage = prev.shift(),
        /** @type {string} **/ userName;

    // page.toolbarTimeline_.href = '#' + prevPage;

    if (prevPage === 'about') {
        // page.toolbarTimeline_.innerHTML = twic.i18n.translate('title_about');

        // trying to find if we are using just one account
        var
            tmpList = document.querySelectorAll('#accounts ul li a');

        if (tmpList.length === 1) {
            page.timelineUserId_ = parseInt(tmpList[0].id, 10);
        } else {
            page.timelineUserId_ = null;
        }
    } else {
        // page.toolbarTimeline_.innerHTML = twic.dom.findElement('#timeline .toolbar p span').innerHTML;
        // page.toolbarTimeline_.href += '#' + prev.join('#');
        // fixme shitcode
        page.timelineUserId_ = parseInt(prev[0], 10);
    }

    if (!data.length
        || 1 !== data.length
    ) {
        // todo return to the accounts list screen
        return;
    }

    userName = data[0];

    // update info if it is not loaded yet
    var pageUserName = page.pageElement_.getAttribute('username');
    if (pageUserName !== userName) {
        page.clearData_();

        page.pageElement_.setAttribute('username', userName);

        twic.requests.makeRequest('getProfileInfo', {
            'name': userName
        }, function(data) {
            page.showProfile_.call(page, data);
        } );
        // todo or show an error
    }
};
