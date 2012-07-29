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

    // page.elementDirect_       = twic.dom.findElement('.toolbar p a', page.pageElement_);
    // page.elementDirect_.title = twic.i18n.translate('title_directly');
    // page.directLinkBase_      = page.elementDirect_.href;
    // page.accountNameElement_  = twic.dom.findElement('.toolbar p span', page.pageElement_);

    // twic.dom.findElement('.toolbar a', page.pageElement_).innerHTML = twic.i18n.translate('toolbar_accounts');
};

twic.pages.MentionsPage.prototype.handle = function(data) {
    var
        page = this;

    twic.Page.prototype.handle.call(page, data);

    if (!data.length
        || 1 !== data.length
    ) {
        window.location.hash = '#accounts';
        return;
    }

    // page.accountNameElement_.innerHTML = '';

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
