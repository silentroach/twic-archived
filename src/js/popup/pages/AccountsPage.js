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
	twic.Page.call(this);

	this.remember = true;

	/**
	 * @type {Element}
	 * @private
	 */
	this.list_ = null;

	/**
	 * @type {Element}
	 * @private
	 */
	this.bottomStatus_ = null;

	/**
	 * @type {Element}
	 * @private
	 */
	this.elementAccountAdd_ = null;

	/**
	 * @type {number}
	 * @private
	 */
	this.removingAccountId_ = 0;

	/**
	 * @type {Element}
	 * @private
	 */
	this.firstAccountElement_ = null;
};

goog.inherits(twic.pages.AccountsPage, twic.Page);

/**
 * @private
 */
twic.pages.AccountsPage.prototype.resetToolbar_ = function() {
	this.bottomStatus_.innerHTML = twic.utils.lang.translate('title_select_or_remove' + (twic.platform === twic.platforms.OSX ? '_osx' : ''));
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
			this.firstAccountElement_.innerText = twic.utils.lang.translate('add_first_account');
			this.firstAccountElement_.style.display = 'block';

			twic.dom.addClass(this.elementAccountAdd_, 'pulsate');

			twic.dom.setVisibility(this.bottomStatus_, false);
		}

		return;
	} else {
		if (this.firstAccountElement_) {
			this.firstAccountElement_.style.display = '';
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

twic.pages.AccountsPage.prototype.accountContextClick_ = function(e) {
	if (
		e.srcElement
		&& e.srcElement.tagName === 'IMG'
		&& e.srcElement.className === 'avatar'
	) {
		var
			page      = this,
			link      = e.srcElement.parentNode,
			container = twic.dom.expandElement('div.container'),
			bYes      = twic.dom.expandElement('a.button'),
			bNo       = twic.dom.expandElement('a.button');

		twic.dom.removeClass(page.elementAccountAdd_, 'pulsate');
		page.removingAccountId_ = link.id;

		page.bottomStatus_.innerHTML = twic.utils.lang.translate('alert_remove_account', link.title);

		bYes.innerHTML = twic.utils.lang.translate('button_yes');
		bYes.href      = '#';

		bYes.addEventListener('click', function(e) {
			e.preventDefault();
			page.removeAccount_.call(page);
		}, false);

		bNo.innerHTML  = twic.utils.lang.translate('button_no');
		bNo.href       = '#';

		bNo.addEventListener('click', function(e) {
			e.preventDefault();
			page.resetToolbar_.call(page, e);
		}, false);

		container.appendChild(bYes);
		container.appendChild(bNo);

		page.bottomStatus_.appendChild(container);
		twic.dom.addClass(page.bottomStatus_, 'alert');
	}
};

twic.pages.AccountsPage.prototype.initOnce = function() {
	twic.Page.prototype.initOnce.call(this);

	var
		page = this,
		loading = false;

	page.list_ = twic.dom.findElement('#accounts ul');
	page.bottomStatus_ = twic.dom.findElement('#accounts_status');
	page.elementAccountAdd_ = twic.dom.findElement('#button_account_add');

	if (twic.platforms.OSX === twic.platform) {
		page.list_.addEventListener('click', function(e) {
			if (e.metaKey) {
				e.preventDefault();
				page.accountContextClick_.call(page, e);
			}
		}, false );
	} else {
		page.list_.addEventListener('contextmenu', page.accountContextClick_.bind(page), false);
	}

	page.firstAccountElement_ = twic.dom.findElement('#accounts p');

	page.elementAccountAdd_.title                   = twic.utils.lang.translate('title_add_account');
	twic.dom.findElement('#button_settings').title  = twic.utils.lang.translate('title_settings');
	twic.dom.findElement('#button_about').title     = twic.utils.lang.translate('title_about');

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

				page.bottomStatus_.innerHTML = twic.utils.lang.translate('alert_account_add_failed');
				twic.dom.addClass(page.bottomStatus_, 'alert');
				page.bottomStatus_.style.display = 'block';
			}
		} );
	}, false);
};

/**
 * @override
 */
twic.pages.AccountsPage.prototype.handle = function(data) {
	twic.Page.prototype.handle.call(this, data);

	this.refresh_();
};
