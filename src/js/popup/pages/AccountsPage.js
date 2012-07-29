/**
 * Accounts page implementation
 *
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

/**
 * @constructor
 * @extends twic.Page
 */
twic.pages.AccountsPage = function() {
    var
        page = this;

    twic.Page.call(page);

    page.remember = true;

    /**
     * @type {Element}
     * @private
     */
    page.toolbar_ = null;

    /**
     * @type {Element}
     * @private
     */
    page.list_ = null;

    /**
     * @type {Element}
     * @private
     */
    page.bottomStatus_ = null;

    /**
     * @type {Element}
     * @private
     */
    page.elementAccountAdd_ = null;

    /**
     * @type {number}
     * @private
     */
    page.removingAccountId_ = 0;

    /**
     * @type {Element}
     * @private
     */
    page.firstAccountElement_ = null;
};

goog.inherits(twic.pages.AccountsPage, twic.Page);

/**
 * @private
 */
twic.pages.AccountsPage.prototype.resetToolbar_ = function() {
    this.bottomStatus_.innerHTML = twic.i18n.translate('title_select_or_remove' + (twic.platform === twic.platforms.OSX ? '_osx' : ''));
    twic.dom.removeClass(this.bottomStatus_, 'alert');
};

/**
 * @private
 */
twic.pages.AccountsPage.prototype.removeAccount_ = function() {
    var
        page = this;

    twic.requests.makeRequest('accountRemove', {
        'id': page.removingAccountId_
    }, function() {
        page.refresh_();
    } );
};

/**
 * @private
 */
twic.pages.AccountsPage.prototype.refresh_ = function() {
    var
        page = this;

    page.resetToolbar_();
    page.clearList_();

    twic.requests.makeRequest('accountList', {}, function(data) {
        page.buildList_.call(page, data);
    } );
};

/**
 * @private
 */
twic.pages.AccountsPage.prototype.clearList_ = function() {
    this.list_.innerHTML = '';
};

/**
 * @private
 * @param {Array} elements
 */
twic.pages.AccountsPage.prototype.buildList_ = function(elements) {
    if (elements.length === 0) {
        if (this.firstAccountElement_) {
            this.firstAccountElement_.innerText = twic.i18n.translate('add_first_account');
            twic.dom.show(this.firstAccountElement_);

            twic.dom.addClass(this.elementAccountAdd_, 'pulsate');

            twic.dom.hide(this.bottomStatus_);
        }

        return;
    } else {
        if (this.firstAccountElement_) {
            twic.dom.hide(this.firstAccountElement_);
        }
    }

    var
        frag = document.createDocumentFragment(),
        i;

    for (i = 0; i < elements.length; ++i) {
        var
            element = elements[i],
            avatar = twic.dom.expandElement('img.avatar'),
            a = twic.dom.expandElement('a#' + element['id']),
            utweets = element['unread_tweets'],
            li = twic.dom.expandElement('li');

        avatar.src = element['avatar'];

        a.title = '@' + element['screen_name'];
        a.href = '#timeline#' + element['id'];

        a.appendChild(avatar);

        if (utweets > 0) {
            var
                utspan = twic.dom.expandElement('span.utweets');

            utspan.innerHTML = utweets;

            a.appendChild(utspan);
        }

        li.appendChild(a);

        frag.appendChild(li);
    }

    this.list_.appendChild(frag);
};

/**
 * Get the account link on click
 * @private
 * @return {Element}
 */
twic.pages.AccountsPage.prototype.getAccountLink_ = function(e) {
    if (e.srcElement
        && e.srcElement.tagName === 'IMG'
        && e.srcElement.className === 'avatar'
    ) {
        return e.srcElement.parentNode;
    }

    return false;
};

/**
 * @private
 */
twic.pages.AccountsPage.prototype.accountClick_ = function(e) {
    var
        page = this,
        accountElement = page.getAccountLink_(e);

    if (accountElement) {
        twic.router.userId = accountElement.id;

        window.location.hash = '#timeline';
    }
};

/**
 * Changes for page to ask user to confirm account remove
 * @private
 * @param {number} userId
 * @param {string} userName
 */
twic.pages.AccountsPage.prototype.prepareRemoveAction_ = function(userId, userName) {
    var
        page      = this,
        container = twic.dom.expandElement('div.container'),
        bYes      = twic.dom.expandElement('a.button'),
        bNo       = twic.dom.expandElement('a.button');

    twic.dom.removeClass(page.elementAccountAdd_, 'pulsate');
    page.removingAccountId_ = userId;

    page.bottomStatus_.innerHTML = twic.i18n.translate('alert_remove_account', userName);

    bYes.innerHTML = twic.i18n.translate('button_yes');
    bYes.href      = '#';

    bYes.addEventListener('click', function(e) {
        e.preventDefault();
        page.removeAccount_.call(page);
    }, false);

    bNo.innerHTML  = twic.i18n.translate('button_no');
    bNo.href       = '#';

    bNo.addEventListener('click', function(e) {
        e.preventDefault();
        page.resetToolbar_.call(page, e);
    }, false);

    container.appendChild(bYes);
    container.appendChild(bNo);

    page.bottomStatus_.appendChild(container);
    twic.dom.addClass(page.bottomStatus_, 'alert');
};

/**
 * @private
 * @param {Event} e
 */
twic.pages.AccountsPage.prototype.accountContextClick_ = function(e) {
    var
        page = this,
        accountElement = page.getAccountLink_(e);

    if (accountElement) {
        page.prepareRemoveAction_(
            accountElement.id,
            accountElement.title
        );
    }
};

twic.pages.AccountsPage.prototype.initOnce = function() {
    twic.Page.prototype.initOnce.call(this);

    var
        page = this,
        loading = false;

    page.toolbar_ = twic.dom.findElement('#toolbar_accounts');

    page.list_ = twic.dom.findElement('#accounts ul');
    page.bottomStatus_ = twic.dom.findElement('#accounts_status');
    page.elementAccountAdd_ = twic.dom.findElement('#button_account_add');

    page.list_.addEventListener('click', function(e) {
        e.preventDefault();

        if (twic.events.isEventWithModifier(e)) {
            page.accountContextClick_.call(page, e);
        } else {
            page.accountClick_.call(page, e);
        }
    }, false );

    if (twic.platforms.OSX !== twic.platform) {
        // for OS X it is checked on click with metaKey pressed (upper event listener)
        page.list_.addEventListener('contextmenu', page.accountContextClick_.bind(page), false);
    }

    page.firstAccountElement_ = twic.dom.findElement('#accounts p');

    page.elementAccountAdd_.title                   = twic.i18n.translate('title_add_account');
    twic.dom.findElement('#button_settings').title  = twic.i18n.translate('title_settings');
    twic.dom.findElement('#button_about').title     = twic.i18n.translate('title_about');

    /**
     * @this {Element}
     */
    twic.dom.findElement('#button_account_add').addEventListener('click', function(e) {
        var
            trg = 'IMG' === e.target.nodeName ? e.target.parentNode : e.target,
            buttonElement = twic.dom.findElement('img', trg),
            oldSource = buttonElement.src;

        if (loading) {
            return false;
        }

        loading = true;

        // @resource img/loader.gif
        buttonElement.src = 'img/loader.gif';
        trg.href = '#accounts';

        twic.requests.makeRequest('accountAdd', { }, function(reply) {
            if (twic.global.SUCCESS === reply['result']) {
                window.close();
            } else {
                buttonElement.src = oldSource;

                page.bottomStatus_.innerHTML = twic.i18n.translate('alert_account_add_failed');
                twic.dom.addClass(page.bottomStatus_, 'alert');
                twic.dom.show(page.bottomStatus_);
            }
        } );
    }, false);
};

/**
 * @override
 */
twic.pages.AccountsPage.prototype.handle = function(data) {
    var
        page = this;

    twic.Page.prototype.handle.call(page, data);

    twic.dom.show(page.toolbar_);
    page.refresh_();
};
