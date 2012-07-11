/**
 * Tweet editor
 *
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

// todo holy shit! reorder it

/**
 * @constructor
 * @param {number} userId User identifier (used to store backup textarea value)
 * @param {Element} parent Parent element
 * @param {string=} replyTo Identifier of reply to tweet
 */
twic.vcl.TweetEditor = function(userId, parent, replyTo) {

    var
        editor = this,
        /** @type {Storage} **/ storage         = window.localStorage,
        /** @type {Element} **/ editorWrapper   = twic.dom.expandElement('div.tweetEditor'),
        /** @type {Element} **/ editorSend      = twic.dom.expandElement('input'),
        /** @type {Element} **/ editorAttach    = twic.dom.expandElement('img.attach.disabled'),
        /** @type {Element} **/ rightButtons    = twic.dom.expandElement('div.rb'),
        /** @type {Element} **/ editorCounter   = twic.dom.expandElement('span'),
        /** @type {Element} **/ clearer         = twic.dom.expandElement('div.clearer');

    twic.EventSupported.call(this);

    /** @type {boolean} **/ editor.autoRemovable = false;

    /**
     * @type {string}
     * @private
     */
    this.constStartVal_ = '';

    /**
     * @type {number}
     * @private
     */
    editor.charCount_ = 0;

    /**
     * @type {Element}
     * @private
     */
    this.suggestBlock_ = twic.dom.expandElement('div');

    /**
     * @type {Element}
     * @private
     */
    this.editorWrapper_ = editorWrapper;

    /**
     * @type {number}
     * @private
     */
    editor.userId_ = userId;

    /**
     * @type {string|undefined}
     * @private
     */
    editor.replyTo_ = replyTo;

    /**
     * @type {Element}
     * @private
     */
    editor.buttonSend_ = editorSend;

    /**
     * @type {Element}
     * @private
     */
    editor.buttonAttach_ = editorAttach;

    /**
     * @type {boolean}
     * @private
     */
    editor.isAttachAbilityChecked_ = false;

    /**
     * @type {Element}
     * @private
     */
    this.editorTextarea_ = twic.dom.expandElement('textarea');

    this.editorTextarea_['spellcheck'] = false;
    this.editorTextarea_.placeholder = twic.utils.lang.translate(
        replyTo ? 'placeholder_tweet_reply' : 'placeholder_tweet_new'
    );

    /**
     * @type {Element}
     * @private
     */
    this.editorCounter_ = editorCounter;

    /**
     * @private
     */
    this.geoLoading_ = false;

    /**
     * @private
     */
    this.geoCoords_ = {
        enabled: false,
        lat: 0,
        lng: 0
    };

    this.geoInfo_ = twic.dom.expandElement('img.geo.disabled');
    // @resource img/buttons/map.png
    this.geoInfo_.src = 'img/buttons/map.png';
    this.geoInfo_.title = twic.utils.lang.translate('title_button_geo') +
        ' - ' + twic.utils.lang.translate('disabled');

    // @resource img/buttons/link.png
    editorAttach.src = 'img/buttons/link.png';
    editorAttach.title = twic.utils.lang.translate('title_attach_link_disabled');

    editorSend.type  = 'button';
    editorSend.value = twic.utils.lang.translate(replyTo ? 'button_reply' : 'button_send');
    editorSend.title = twic.utils.lang.translate(
        'title_button_send' +
        (twic.platforms.OSX === twic.platform ? '_osx' : '')
    );

    rightButtons.appendChild(this.geoInfo_);
    rightButtons.appendChild(editorAttach);
    rightButtons.appendChild(editorSend);

    editorWrapper.appendChild(this.editorTextarea_);
    editorWrapper.appendChild(this.suggestBlock_);

    editorWrapper.appendChild(editorCounter);
    editorWrapper.appendChild(rightButtons);
    editorWrapper.appendChild(clearer);

    if (parent.childElementCount > 0) {
        parent.insertBefore(editorWrapper, parent.firstChild);
    } else {
        parent.appendChild(editorWrapper);
    }

    this.geoInfo_.addEventListener('click', function() {
        editor.toggleMap_.call(editor);
    }, false );

    /**
     * Try to send the tweet
     */
    var tryToSend = function() {
        if (0 === editor.editorTextarea_.value.length) {
            return true;
        }

        var
            tweet = new twic.cobj.Tweet();

        tweet.text = editor.editorTextarea_.value;

        if (editor.geoCoords_.enabled) {
            tweet.coords.enabled = true;
            tweet.coords.lat = editor.geoCoords_.lat;
            tweet.coords.lng = editor.geoCoords_.lng;
        }

        // loading state
        twic.dom.addClass(editorWrapper, twic.vcl.TweetEditor.sendingClass);
        editorCounter.innerHTML = '&nbsp;';
        editorSend.disabled = true;

        editor.onTweetSend(editor, tweet, replyTo, function() {
            editor.reset();

            if (editor.autoRemovable) {
                editor.close();
            }
        } );
    };

    // store the textarea value on each keyup to avoid data loss on popup close
    this.editorTextarea_.addEventListener('keyup', function(e) {
        if (13 === e.keyCode) {
            return false;
        }

        editor.keyUpHandler_();
    }, false );

    // prevent user to press enter
    this.editorTextarea_.addEventListener('keydown', function(e) {
        switch (e.keyCode) {
            // backspace
            case 8:
                // do not allow to remove the constant part
                var constStartValLength = editor.constStartVal_.length;

                if (constStartValLength > 0
                    && editor.editorTextarea_.value.length <= constStartValLength
                ) {
                    e.preventDefault();
                }

                break;
            // enter
            case 13:
                e.preventDefault();

                if (twic.events.isEventWithModifier(e)) {
                    e.stopPropagation();

                    if (editor.charCount_ > 0
                        && editor.charCount_ < 141
                    ) {
                        tryToSend();
                    }
                }

                break;
        }
    }, false );

    var handleOutClick = function(e) {
        if (twic.dom.hasClass(editorWrapper, twic.vcl.TweetEditor.focusedClass) &&
            !twic.dom.isChildOf(e.target, editorWrapper)
        ) {
            twic.dom.removeClass(editorWrapper, twic.vcl.TweetEditor.focusedClass);
        }
    };

    this.editorTextarea_.addEventListener('focus', function(e) {
        if (!editor.isAttachAbilityChecked_) {
            editor.isAttachAbilityChecked_ = true;
            editor.checkLinkAttachAbility_();
        }

        twic.dom.addClass(editorWrapper, twic.vcl.TweetEditor.focusedClass);
        editor.checkTweetArea_();

        editor.triggerEvent_('focus');
    }, false );

    editorSend.addEventListener('click', function() {
        tryToSend();
    }, false );

    var reset = function() {
        editor.editorTextarea_.value = '';
        editor.editorTextarea_.rows = 1;
        editor.editorTextarea_.blur();

        editorCounter.innerHTML = twic.vcl.TweetEditor.MAXCOUNT.toString();

        twic.dom.removeClass(editorWrapper, twic.vcl.TweetEditor.focusedClass);
        twic.dom.removeClass(editorWrapper, twic.vcl.TweetEditor.sendingClass);
    };

    document.addEventListener('click', handleOutClick, false);

    // init

    reset();

    var backupText = storage.getItem(editor.getBackupStoragePath_());
    if (backupText) {
        this.editorTextarea_.value = backupText;
        // timeout to resize it after ui is loaded
        setTimeout( function() {
            editor.checkTweetArea_();
        }, 200);
    }

    // functions

    editor.reset = function() {
        // empty the localstorage backup
        storage.removeItem(editor.getBackupStoragePath_());

        reset();
    };

    editor.close = function() {
        document.removeEventListener('click', handleOutClick, false);

        twic.dom.removeElement(editorWrapper);

        editor.triggerEvent_('close', editor);
    };

    var suggest = new twic.vcl.Suggest(this);
    suggest.addEventListener('select', function() {
        editor.checkTweetArea_.call(editor);
    } );
};

goog.inherits(twic.vcl.TweetEditor, twic.EventSupported);

twic.vcl.TweetEditor.options = {
    short_url_length: 20,
    short_url_length_https: 21
};

/**
 * Current tab url is already checked
 * @type {boolean}
 * @private
 */
twic.vcl.TweetEditor.currentTabChecked_ = false;

/**
 * Current url to paste it into the tweet
 * @type {boolean|string}
 * @private
 */
twic.vcl.TweetEditor.currentURL_ = false;

/**
 * Current title to paste it into the tweet
 * @type {boolean|string}
 * @private
 */
twic.vcl.TweetEditor.currentTitle_ = '';

// ------------------------------------------

/** @const **/ twic.vcl.TweetEditor.overloadClass = 'overload';
/** @const **/ twic.vcl.TweetEditor.focusedClass  = 'focused';
/** @const **/ twic.vcl.TweetEditor.sendingClass  = 'sending';
/** @const **/ twic.vcl.TweetEditor.MAXCOUNT = 140;

/**
 * Check the ability to attach link to tweet
 * @private
 */
twic.vcl.TweetEditor.prototype.checkLinkAttachAbility_ = function() {
    var
        editor = this;

    var doAssignAttachEvent = function() {
        editor.buttonAttach_.title = twic.utils.lang.translate(
            'title_attach_link' +
            (twic.platforms.OSX === twic.platform ? '_osx' : '')
        );

        editor.buttonAttach_.addEventListener('click', function(e) {
            editor.onInsertCurrentLink_.call(editor, e);
        }, false);

        twic.dom.removeClass(editor.buttonAttach_, 'disabled');
    };

    if (!twic.vcl.TweetEditor.currentTabChecked_) {
        twic.vcl.TweetEditor.currentTabChecked_ = true;

        chrome.tabs.getSelected(null, function(tab) {
            if (tab) {
                var
                    url = tab.url.trim(),
                    title = tab.title.trim();

                if (url.length > 7
                    && ('http' === url.substr(0, 4)
                        || 'ftp' === url.substr(0, 3)
                    )
                ) {
                    if ('/' === url.substr(-1)) {
                        url = url.substring(0, url.length - 1);
                    }

                    twic.vcl.TweetEditor.currentURL_ = url;
                    twic.vcl.TweetEditor.currentTitle_ = title;

                    doAssignAttachEvent();
                }
            }
        } );
    } else
    if (twic.vcl.TweetEditor.currentURL_) {
        doAssignAttachEvent();
    }
};

/**
 * Check the tweet editor area
 * @private
 */
twic.vcl.TweetEditor.prototype.checkTweetArea_ = function() {
    var
        editor = this,
        val = editor.editorTextarea_.value;

    if (twic.dom.hasClass(editor.editorWrapper_, twic.vcl.TweetEditor.sendingClass)) {
        return;
    }

    if (val.substring(0, editor.constStartVal_.length) !== editor.constStartVal_) {
        editor.editorTextarea_.value = editor.constStartVal_;
        editor.editorTextarea_.selectionStart = editor.editorTextarea_.selectionEnd = editor.constStartVal_.length;
        val = editor.constStartVal_;
    }

    editor.charCount_ = editor.getCharCount_();

    while (editor.editorTextarea_.rows > 1
        && editor.editorTextarea_.scrollHeight <= editor.editorTextarea_.offsetHeight
    ) {
        --editor.editorTextarea_.rows;
    }

    while (editor.editorTextarea_.scrollHeight > editor.editorTextarea_.offsetHeight) {
        ++editor.editorTextarea_.rows;
    }

    editor.editorCounter_.innerHTML = (twic.vcl.TweetEditor.MAXCOUNT - editor.charCount_).toString();

    if (editor.charCount_ > twic.vcl.TweetEditor.MAXCOUNT) {
        twic.dom.addClass(editor.editorWrapper_, twic.vcl.TweetEditor.overloadClass);
    } else {
        twic.dom.removeClass(editor.editorWrapper_, twic.vcl.TweetEditor.overloadClass);
    }

    editor.buttonSend_.disabled = (
        editor.charCount_ === 0
        || editor.charCount_ > twic.vcl.TweetEditor.MAXCOUNT
        || val === editor.constStartVal_
    );
};

/**
 * Function to get the path to localStorage element
 * @return {string}
 */
twic.vcl.TweetEditor.prototype.getBackupStoragePath_ = function() {
    var
        editor = this;

    return 'tweetEditor_' + editor.userId_ +
        (editor.replyTo_ ? '_' + editor.replyTo_ : '');
};

/**
 * Insert current tab link into editor area
 * @private
 */
twic.vcl.TweetEditor.prototype.onInsertCurrentLink_ = function(e) {
    var
        editor = this,
        url = twic.vcl.TweetEditor.currentURL_,
        title = twic.vcl.TweetEditor.currentTitle_,
        selStart = editor.editorTextarea_.selectionStart,
        selEnd = editor.editorTextarea_.selectionEnd,
        newVal = editor.editorTextarea_.value.substr(0, selStart);

    if (newVal.length > 0
        && ' ' !== newVal.substr(-1)
    ) {
        newVal += ' ';
    }

    newVal += url + (
        twic.events.isEventWithModifier(e) && '' !== title ? ' ' + title : ''
    );

    if (' ' !== editor.editorTextarea_.value.substr(selEnd).substr(0, 1)) {
        newVal += ' ';
    }

    selStart = newVal.length;

    newVal += editor.editorTextarea_.value.substr(selEnd);

    editor.editorTextarea_.value = newVal;

    editor.editorTextarea_.selectionStart = selStart;
    editor.editorTextarea_.selectionEnd = selStart;

    editor.editorTextarea_.focus();

    editor.keyUpHandler_();
};

/**
 * Key up handler
 * @private
 */
twic.vcl.TweetEditor.prototype.keyUpHandler_ = function() {
    var
        editor = this,
        val  = editor.editorTextarea_.value,
        storage = window.localStorage,
        path = editor.getBackupStoragePath_();

    editor.checkTweetArea_();

    if (val === '' ||
        val === editor.constStartVal_.trim() ||
        val.length < editor.constStartVal_.length
    ) {
        storage.removeItem(path);
    } else {
        storage.setItem(path, val);
    }
};

/**
 * @param {boolean=} setstart Set the cursor to the start
 */
twic.vcl.TweetEditor.prototype.setFocus = function(setstart) {
    this.editorTextarea_.selectionStart = setstart ? 0 : this.editorTextarea_.selectionEnd = this.editorTextarea_.value.length;
    this.editorTextarea_.focus();
};

/**
 * Set the editor text
 * @param {string} text Tweet text
 */
twic.vcl.TweetEditor.prototype.setText = function(text) {
    this.constStartVal_ = '';
    this.editorTextarea_.value = text;
};

/**
 * Enable geolocation info insert
 * @param {boolean} show Really?
 */
twic.vcl.TweetEditor.prototype.toggleGeo = function(show) {
    if (show) {
        twic.dom.addClass(this.editorWrapper_, 'geo');
    } else {
        twic.dom.removeClass(this.editorWrapper_, 'geo');
    }
};

/**
 * @param {Object.<result: boolean, coords: Object.<lat: number, lng: number>, ts: number>} coords Current coordinates
 * @private
 */
twic.vcl.TweetEditor.prototype.onMapCoordsReply_ = function(reply) {
    var
        editor = this;

    editor.geoInfo_.src = editor.geoInfo_.getAttribute('old-src');

    if (!reply) {
        editor.geoCoords_.enabled = false;

        editor.geoInfo_.title = twic.utils.lang.translate('title_button_geo_failed');
        twic.dom.addClass(editor.geoInfo_, 'disabled');
    } else {
        editor.geoLoading_ = false;

        editor.geoCoords_.enabled = true;
        editor.geoCoords_.lat = reply[0];
        editor.geoCoords_.lng = reply[1];

        editor.geoInfo_.title = twic.utils.lang.translate('title_button_geo') +
            ' - ' + twic.utils.lang.translate('enabled');

        twic.dom.removeClass(editor.geoInfo_, 'disabled');
    }
};

/**
 * Toggle tweet geolocation info
 * @private
 */
twic.vcl.TweetEditor.prototype.toggleMap_ = function() {
    var
        editor = this;

    if (!this.geoCoords_.enabled) {
        if (this.geoLoading_) {
            return true;
        } else {
            this.geoLoading_ = true;
        }

        this.geoInfo_.setAttribute('old-src', this.geoInfo_.src);
        // @resource img/loader.gif
        this.geoInfo_.src = 'img/loader.gif';

        twic.requests.makeRequest('getCoords', { }, function(reply) {
            editor.onMapCoordsReply_.call(editor, reply);
        } );
    } else {
        this.geoCoords_.enabled = false;

        this.geoInfo_.title = twic.utils.lang.translate('title_button_geo') + ' - ' + twic.utils.lang.translate('disabled');
        this.geoInfo_.classList.add('disabled');
    }
};

/**
 * Get the current char count
 * @private
 */
twic.vcl.TweetEditor.prototype.getCharCount_ = function() {
    var
        val = this.editorTextarea_.value,
        len = val.length,
        links = twic.text.extractUrls(val),
        link = '',
        i;

    if (links) {
        for(i = 0; i < links.length; ++i) {
            link = links[i];

            len -= link.length;

            if (link.length > 7
                && 'https://' === link.substr(0, 8)
            ) {
                len += twic.vcl.TweetEditor.options.short_url_length_https;
            } else {
                len += twic.vcl.TweetEditor.options.short_url_length;
            }
        }
    }

    return len;
};

/**
 * Set the constant editor text
 * @param {string} text Constant tweet part
 * @param {boolean} spaceAfter Insert space after constant part
 */
twic.vcl.TweetEditor.prototype.setConstTextIfEmpty = function(text, spaceAfter) {
    if ('' === this.editorTextarea_.value) {
        this.constStartVal_ = text;

        if (spaceAfter) {
            text += ' ';
        }

        this.editorTextarea_.value = text;
    }
};

/**
 * Get the suggest place
 * @return {Element}
 */
twic.vcl.TweetEditor.prototype.getSuggestBlock = function() {
    return this.suggestBlock_;
};

/**
 * Get the textarea
 * @return {Element}
 */
twic.vcl.TweetEditor.prototype.getTextarea = function() {
    return this.editorTextarea_;
};

/**
 * Handler for tweet send process
 * @param {twic.vcl.TweetEditor} editor Editor
 * @param {twic.cobj.Tweet} tweet Tweet common object
 * @param {string=} replyTo Reply to tweet
 * @param {function()=} callback Callback for reset
 */
twic.vcl.TweetEditor.prototype.onTweetSend = function(editor, tweet, replyTo, callback) {
    callback();
};

/**
 * Get the suggest list
 * @param {string} startPart Start part of the nick
 * @param {function(Array)} callback Callback function
 */
twic.vcl.TweetEditor.prototype.onGetSuggestList = function(startPart, callback) {
    callback( [ ] );
};
