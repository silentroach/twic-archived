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
    twic.Page.call(this);

    /**
     * @type {boolean}
     * @private
     */
    this.unfollowOver_ = false;

    /**
     * @type {Element}
     * @private
     */
    this.container_ = null;

    /**
     * @type {Element}
     * @private
     */
    this.elementLoader_ = null;

    /**
     * @type {Element}
     * @private
     */
    this.elementAvatar_ = null;

    /**
     * @type {Element}
     * @private
     */
    this.elementName_ = null;

    /**
     * @type {Element}
     * @private
     */
    this.elementNick_ = null;

    /**
     * @type {Element}
     * @private
     */
    this.elementUrl_ = null;

    /**
     * @type {Element}
     * @private
     */
    this.elementBio_ = null;

    /**
     * @type {Element}
     * @private
     */
    this.elementLocation_ = null;

    /**
     * @type {Element}
     * @private
     */
    this.elementFollowings_ = null;

    /**
     * @type {Element}
     * @private
     */
    this.elementFollowed_ = null;

    /**
     * @type {Element}
     * @private
     */
    this.elementFollowedSpan_ = null;

    /**
     * @type {Element}
     * @private
     */
    this.elementDirect_ = null;

    /**
     * @type {Element}
     * @private
     */
    this.elementProps_ = null;

    /**
     * @type {Element}
     * @private
     */
    this.elementMap_ = null;

    /**
     * @type {number}
     * @private
     */
    this.timelineUserId = 0;

    /**
     * @type {number}
     * @private
     */
    this.profileUserId = 0;

    /**
     * @type {Element}
     * @private
     */
    this.toolbarTimeline_ = null;

    /**
     * @type {string}
     * @private
     */
    this.directLinkBase_ = '';

    /**
     * @type {twic.vcl.Map}
     * @private
     */
    this.map_ = null;
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

    twic.Page.prototype.initOnce.call(page);

    page.container_ = twic.dom.findElement('#profile');

    page.elementFollowings_   = twic.dom.findElement('#followings');
    page.elementFollowed_     = twic.dom.findElement('p', page.elementFollowings_);
    page.elementFollowedSpan_ = twic.dom.findElement('span', page.elementFollowings_);

    page.elementDirect_       = twic.dom.findElement('.toolbar p a', page.container_);
    page.elementDirect_.title = twic.utils.lang.translate('title_directly');
    page.directLinkBase_      = page.elementDirect_.href;

    page.elementLoader_   = twic.dom.findElement('.loader', page.container_);
    page.elementAvatar_   = twic.dom.findElement('.avatar', page.container_);
    page.elementName_     = twic.dom.findElement('.name', page.container_);
    page.elementNick_     = twic.dom.findElement('.toolbar p span', page.container_);
    page.elementUrl_      = twic.dom.findElement('.url', page.container_);
    page.elementBio_      = twic.dom.findElement('.bio', page.container_);
    page.elementLocation_ = twic.dom.findElement('.location', page.container_);
    page.toolbarTimeline_ = twic.dom.findElement('.toolbar a', page.container_);

    page.elementMap_      = twic.dom.findElement('.map', page.container_);

    page.elementProps_    = twic.dom.findElement('.props', page.container_);

    twic.dom.findElement('.protected', page.elementProps_).title = twic.utils.lang.translate('title_protected');
};

/**
 * Clear the profile data
 * @private
 */
twic.pages.ProfilePage.prototype.clearData_ = function() {
    this.elementFollowedSpan_.className = '';
    this.elementFollowed_.className = '';
    this.elementLoader_.style.display = 'block';
    this.elementAvatar_.src = '';
    this.elementProps_.className = 'props';
    this.elementName_.innerHTML = '';
    this.elementNick_.innerHTML = '';
    this.elementUrl_.innerHTML = '';
    this.elementBio_.innerHTML = '';
    this.elementLocation_.innerHTML = '';
    this.elementFollowedSpan_.innerHTML = '';
    delete this.map_;

    twic.dom.setVisibility(this.elementAvatar_, false);
    twic.dom.setVisibility(this.elementFollowings_, false);
    twic.dom.setVisibility(this.elementBio_, false);
    twic.dom.setVisibility(this.elementLocation_, false);
    twic.dom.setVisibility(this.elementMap_, false);
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
        page.elementFollowedSpan_.innerHTML = twic.utils.lang.translate('button_following');

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
        page.elementFollowedSpan_.innerHTML = twic.utils.lang.translate('button_follow');

        page.elementFollowed_.onmouseover = null;
        page.elementFollowed_.onmouseout = null;
        page.elementFollowed_.onclick = function() {
            page.follow_.call(page);
        };
    }

    page.elementFollowings_.style.display = 'block';
};

/**
 * @private
 */
twic.pages.ProfilePage.prototype.onFollowedMouseOver_ = function() {
    if (!this.unfollowOver_) {
        this.unfollowOver_ = true;
        this.elementFollowedSpan_.innerHTML = twic.utils.lang.translate('button_unfollow');
    }
};

/**
 * @private
 */
twic.pages.ProfilePage.prototype.onFollowedMouseOut_ = function() {
    if (this.unfollowOver_) {
        this.unfollowOver_ = false;
        this.elementFollowedSpan_.innerHTML = twic.utils.lang.translate('button_following');
    }
};

/**
 * @private
 * @param {Object} data
 */
twic.pages.ProfilePage.prototype.showProfile_ = function(data) {
    var
        page = this,
        /** @type {Element} **/ marginElement = null,
        /** @type {string} **/  description = data['description'],
        /** @type {string} **/  loc = data['location'];

    page.profileUserId_ = data['id'];

    // fixme shitcode
    page.elementAvatar_.src = data['avatar'].replace('_normal.', '_bigger.');
    page.elementAvatar_.title = '@' + data['screen_name'];
    page.elementAvatar_.style.display = '';

    // user properties
    if (data['is_protected']) {
        twic.dom.addClass(page.elementProps_, 'protected');
    }

    page.elementName_.innerHTML = data['name'];
    page.elementNick_.innerHTML = '@' + data['screen_name'];

    page.elementDirect_.href = page.directLinkBase_ + data['screen_name'];

    if (data['url'] !== '') {
        page.elementUrl_.innerHTML = twic.utils.url.humanize(data['url']);
    }

/*
    if (loc.trim() !== '') {
        page.elementLocation_.style.display = 'block';
        marginElement = page.elementLocation_;

        // trying to find the coordinates
        var coords = twic.pages.ProfilePage.REGEXP_COORDS.exec(loc);

        if (coords
            && 3 === coords.length
        ) {
            var
                coordsData = coords.shift().split(',');

            page.map_ = new twic.vcl.Map(page.elementMap_, coordsData.shift(), coordsData.shift());
        }

        page.elementLocation_.innerHTML = loc;
    }
*/

    if (description.trim() !== '') {
        page.elementBio_.innerHTML = twic.utils.url.processText(description);
        page.elementBio_.style.display = 'block';
        marginElement = page.elementBio_;
    }

    if (marginElement) {
        marginElement.style.marginTop = '1em';
    }

    if (
        !page.timelineUserId_
        || page.timelineUserId_ === data['id']
    ) {
        twic.dom.setVisibility(page.elementLoader_, false);
    } else {
        twic.requests.makeRequest('getProfileFriendshipInfo', {
            'source_id': page.timelineUserId_,
            'target_id': data['id']
        }, function(data) {
            twic.dom.setVisibility(page.elementLoader_, false);
            page.showProfileFriendship_(data['following']);
            page.elementFollowings_.style.display = 'block';
        } );
    }
};

twic.pages.ProfilePage.prototype.handle = function(data) {
    twic.Page.prototype.handle.call(this, data);

    var
        page = this,
        prev = twic.router.previous(),
        /** @type {string} **/ prevPage = prev.shift(),
        /** @type {string} **/ userName;

    page.toolbarTimeline_.href = '#' + prevPage;

    if (prevPage === 'about') {
        page.toolbarTimeline_.innerHTML = twic.utils.lang.translate('title_about');

        // trying to find if we are using just one account
        var
            tmpList = document.querySelectorAll('#accounts ul li a');

        if (tmpList.length === 1) {
            page.timelineUserId_ = parseInt(tmpList[0].id, 10);
        } else {
            page.timelineUserId_ = null;
        }
    } else {
        page.toolbarTimeline_.innerHTML = twic.dom.findElement('#timeline .toolbar p span').innerHTML;
        page.toolbarTimeline_.href += '#' + prev.join('#');
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
    var pageUserName = page.container_.getAttribute('username');
    if (pageUserName !== userName) {
        page.clearData_();

        page.container_.setAttribute('username', userName);

        twic.requests.makeRequest('getProfileInfo', {
            'name': userName
        }, function(data) {
            page.showProfile_.call(page, data);
        } );
        // todo or show an error
    }
};
