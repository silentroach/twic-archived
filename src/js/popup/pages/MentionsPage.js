/**
 * Mentions page implementation
 *
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

/**
 * @constructor
 * @extends twic.pages.TimelinePage
 */
twic.pages.MentionsPage = function() {
    var
        page = this;

    twic.pages.TimelinePage.call(page);

    page.getMethod_ = 'getMentions';
};

goog.inherits(twic.pages.MentionsPage, twic.pages.TimelinePage);

twic.pages.MentionsPage.prototype.initOnce = function() {
    var
        page = this;

    page.pageElement_ = twic.dom.findElement('#mentions');

    twic.pages.TimelinePage.prototype.initOnce.call(page);
};

twic.pages.MentionsPage.prototype.handle = function(data) {
    var
        page = this;

    twic.Page.prototype.handle.call(page, data);

    if (!twic.router.userId) {
        window.location.hash = '#accounts';
        return;
    }

    page.userId_ = twic.router.userId;

    twic.requests.makeRequest('getUserInfo', {
        'id': twic.router.userId
    }, function(info) {
        var
            geoEnabled = 1 == info['geo_enabled'];

        page.timeline_.geoEnabled = geoEnabled;
    } );

    page.update_();
};
