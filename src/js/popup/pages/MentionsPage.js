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
    twic.pages.TimelinePage.call(this);

};

goog.inherits(twic.pages.MentionsPage, twic.pages.TimelinePage);

twic.pages.MentionsPage.prototype.initOnce = function() {
    var
        page = this;

    page.page_ = twic.dom.findElement('#mentions');

    twic.pages.TimelinePage.prototype.initOnce.call(page);

    page.elementDirect_       = twic.dom.findElement('.toolbar p a', page.page_);
    page.elementDirect_.title = twic.i18n.translate('title_directly');
    page.directLinkBase_      = page.elementDirect_.href;
    page.accountNameElement_  = twic.dom.findElement('.toolbar p span', page.page_);

    twic.dom.findElement('.toolbar a', page.page_).innerHTML = twic.i18n.translate('toolbar_accounts');
};

twic.pages.MentionsPage.prototype.handle = function(data) {
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

    twic.requests.makeRequest('getUserInfo', {
        'id': userId
    }, function(info) {
        var
            geoEnabled = 1 == info['geo_enabled'];

        page.timeline_.geoEnabled = geoEnabled;
    } );

    page.update_();
};
