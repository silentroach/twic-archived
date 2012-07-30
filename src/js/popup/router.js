/**
 * Router object
 * Handle page switching in popup
 *
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

twic.router = { };

/**
 * @type {Array.<string>}
 * @private
 */
twic.router.location_ = [];

/**
 * @type {number}
 */
twic.router.userId = 0;

/**
 * @type {Object.<string, Element>}
 * @private
 */
twic.router.frames_ = ( function() {
    var
        tmp = document.querySelectorAll('div.page'),
        res = { },
        i;

    for (i = 0; i < tmp.length; ++i) {
        res[tmp[i].id] = tmp[i];
    }

    return res;
}() );

/**
 * @type {string}
 * @private
 */
twic.router.currentFrame_ = '';

/**
 * @type {Array.<string>}
 * @private
 */
twic.router.previousLocation_ = [];

/**
 * Initialized pages
 * @private
 * @type {Object.<string, twic.Page>}
 */
twic.router.pages_ = { };

/**
 * Toolbar buttons
 * @private
 * @type {Object.<string, number>}
 */
twic.router.toolbarButtons_ = { };

/**
 * Router handlers
 * @private
 * @type {Object.<string, !function(new:twic.Page)>}
 */
twic.router.handlers_ = { };

/**
 * Key used to store last popup location
 * @const
 */
twic.router.STORAGE_LOCATION = 'router_location';

/**
 * Key used to store last user id
 * @const
 */
twic.router.STORAGE_USER_ID  = 'router_user_id';

/**
 * Get the previous frame names
 * @return {Array.<string>}
 */
twic.router.previous = function() {
    return twic.router.previousLocation_;
};

/**
 * Register the page with url part
 * @param {string} hash Hash
 * @param {function()} pageCtor Page constructor
 * @param {?string} icon Icon path
 */
twic.router.register = function(hash, pageCtor, icon) {
    twic.router.handlers_[hash] = pageCtor;

    if (icon) {
        twic.router.toolbarButtons_[hash] = icon;
    }
};

/**
 * Change the frame
 * @private
 * @param {string} targetFrameName Target frame names
 * @param {Array.<string>} data Data from url
 */
twic.router.changeFrame_ = function(targetFrameName, data) {
    var
        page = null,
        ls;

    if (twic.router.currentFrame_) {
        twic.dom.hide(twic.router.frames_[twic.router.currentFrame_]);
    }

    twic.router.currentFrame_ = targetFrameName;

    if (!(targetFrameName in twic.router.pages_)) {
        page = new twic.router.handlers_[targetFrameName]();
        page.initOnce();

        twic.router.pages_[targetFrameName] = page;
    } else {
        page = twic.router.pages_[targetFrameName];
    }

    twic.dom.show(twic.router.frames_[targetFrameName]);
    page.handle.call(page, data);

    if (page.remember) {
        ls = window.localStorage;

        ls.setItem(twic.router.STORAGE_USER_ID,  twic.router.userId);
        ls.setItem(twic.router.STORAGE_LOCATION, twic.router.location_.join('#'));
    }
};

twic.router.handleHashChange = function() {
    // store the previous location
    twic.router.previousLocation_ = twic.router.location_;

    twic.router.location_ = window.location.hash.split('#');
    twic.router.location_.shift();

    var trg = twic.router.location_[0];

    if (trg
        && twic.router.currentFrame_ !== trg
        && trg in twic.router.handlers_
    ) {
        twic.router.changeFrame_(trg, twic.router.location_.slice(1));
    }
};

twic.router.init = function() {
    var
        ls = window.localStorage,
        lastUser = ls.getItem(twic.router.STORAGE_USER_ID),
        lastLocation = ls.getItem(twic.router.STORAGE_LOCATION);

    // @todo remove in vertion 0.51
    ls.removeItem('location');

    // some user remembered?
    if (lastUser) {
        twic.debug.info('Last remembered user:', lastUser);

        twic.router.userId = parseInt(lastUser, 10);
    }

    // try to switch to the page we remember before popup was closed
    if (lastLocation) {
        twic.debug.info('Last stored location:', lastLocation);

        // go to the previous remembered location
        window.location = window.location.pathname + '#' + lastLocation;
    }

    twic.router.handleHashChange();
};

// -------------------------------------------------------------------

window.addEventListener('hashchange', twic.router.handleHashChange, false);
