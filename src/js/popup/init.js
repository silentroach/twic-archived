/**
 * Init script for popup
 *
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

// some handlers

// handling clicks on links with "data-url" property
// special hack to allow users to open links in
// background with middle mouse click (or with metaKey + click in MacOS)
document.addEventListener('click', function(e) {
    var
        link = 'A' === e.target.nodeName
            ? e.target
            : e.target.parentElement && 'A' === e.target.parentElement.nodeName
                ? e.target.parentElement
                : null;

    if (link
        // only for left and middle mouse buttons
        && e.button < 2
    ) {
        var
            attr = link.getAttribute('href'),
            trg  = link.getAttribute('target');

        if (attr
            && '_blank' === trg
        ) {
            e.preventDefault();
            e.stopPropagation();

            chrome.tabs.create( {
                'url': attr,
                // only select the new tab if left button is pressed
                'active': 0 === e.button && !twic.events.isEventWithModifier(e)
            } );

            if (0 === e.button
                && !twic.events.isEventWithModifier(e)
            ) {
                // left button click, closing the window, special for os x
                window.close();
            }
        }
    }
}, false);

// translate toolbars

twic.dom.findElement('#toolbar_default .direct').title = twic.i18n.translate('title_directly');

// register pages

twic.router.register('profile', twic.pages.ProfilePage);
twic.router.register('accounts', twic.pages.AccountsPage);
twic.router.register('timeline', twic.pages.HomeTimelinePage);
twic.router.register('mentions', twic.pages.MentionsPage);
//twic.router.register('conversation', twic.pages.ConversationPage);
twic.router.register('about', twic.pages.AboutPage);

// init all the options and only then trigger window.onchange
async.forEach( [
    function(callback) {
        twic.options.get('avatar_size', function(tmpVal) {
            var
                avSize = parseInt(tmpVal, 10);

            if (32 === avSize) {
                twic.vcl.Timeline.options.avatarSizeDefault = false;
            }

            callback();
        } );
    },
    function(callback) {
        twic.options.get('tweet_show_time', function(value) {
            twic.vcl.Timeline.options.showTime = value;

            callback();
        } );
    },
    function(callback) {
        twic.options.get('tweet_show_time_link', function(value) {
            twic.vcl.Timeline.options.showTimeAsLink = value;

            callback();
        } );
    },
    function(callback) {
        twic.options.get('short_url_length', function(value) {
            twic.vcl.TweetEditor.options.short_url_length = parseInt(value, 10);

            callback();
        } );
    },
    function(callback) {
        twic.options.get('short_url_length_https', function(value) {
            twic.vcl.TweetEditor.options.short_url_length_https = parseInt(value, 10);

            callback();
        } );
    }
], function(func, callback) {
    func(callback);
}, function() {
    // try to switch to the page we remember before popup was closed

    var lastLocation = window.localStorage.getItem('location');

    if (lastLocation) {
        twic.debug.info('Last stored location:', lastLocation);

        // go to the previous remembered location
        window.location = window.location.pathname + '#' + lastLocation;
    }

    window.onhashchange();
} );
