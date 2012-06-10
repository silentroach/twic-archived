/**
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

/**
 * Suggest element
 * @constructor
 * @param {!twic.vcl.TweetEditor} editor
 */
twic.vcl.Suggest = function(editor) {

    var
        suggest = this;

    /**
     * @type {Element}
     * @private
     */
    suggest.nickList_ = twic.dom.expandElement('ul.suggest');

    /**
     * @type {twic.vcl.TweetEditor}
     * @private
     */
    suggest.editor_ = editor;

    /**
     * @type {Element}
     * @private
     */
    suggest.textarea_ = editor.getTextarea();

    /**
     * @type {boolean}
     * @private
     */
    suggest.visible_ = false;

    /**
     * @type {boolean}
     * @private
     */
    suggest.focused_ = false;

    /**
     * @type {string}
     * @private
     */
    suggest.part_ = '';

    editor.getSuggestBlock().appendChild(
        suggest.nickList_
    );

    // ----------------------------------------------------

    suggest.nickList_.addEventListener('click', function(e) {
        suggest.onListClick_.call(suggest, e);
    }, false);

    // prevent user to press enter
    suggest.textarea_.addEventListener('keydown', function(e) {
        suggest.onKeyDown_.call(suggest, e);
    }, false);
    suggest.textarea_.addEventListener('keyup', function(e) {
        suggest.check_.call(suggest, e);
    }, false);
};

/**
 * Get the selected suggest item
 * @private
 * @return {Element}
 */
twic.vcl.Suggest.prototype.getSelectedElement_ = function() {
    return twic.dom.findElement('.selected', this.nickList_);
};

/**
 * Reset the selected suggest item
 * @private
 */
twic.vcl.Suggest.prototype.resetSelection_ = function() {
    var
        selectedElement = this.getSelectedElement_();

    if (selectedElement) {
        twic.dom.removeClass(selectedElement, 'selected');
    }

    this.focused_ = false;
};

/**
 * Handler for the suggest list click
 * @private
 * @param {Event} e
 */
twic.vcl.Suggest.prototype.onListClick_ = function(e) {
    var
        selEl = this.getSelectedElement_(),
        trgEl = e.target;

    e.preventDefault();
    e.stopPropagation();

    if ('LI' !== trgEl.tagName) {
        trgEl = trgEl.parentElement;
    }

    if (selEl
        && selEl !== trgEl
    ) {
        selEl.classList.remove('selected');
    }

    trgEl.classList.add('selected');

    this.select_();
};

/**
 * Handling the keydown event
 * @private
 * @param {KeyboardEvent} e Event
 */
twic.vcl.Suggest.prototype.onKeyDown_ = function(e) {
    switch (e.keyCode) {
        // enter
        case 13:
            if (this.visible_
                && this.focused_
            ) {
                this.select_();
            }

            break;
        // left
        case 37:
            if (this.visible_
                && this.focused_
            ) {
                e.preventDefault();
                this.move_(false);
            }

            break;
        // up
        case 38:
            if (this.visible_
                && this.focused_
            ) {
                e.preventDefault();
                this.resetSelection_();
            }

            break;
        // right
        case 39:
            if (this.visible_
                && this.focused_
            ) {
                e.preventDefault();
                this.move_(true);
            }

            break;
        // down
        case 40:
            if (this.visible_) {
                e.preventDefault();

                if (this.focused_) {
                    this.resetSelection_();
                } else {
                    this.focus_();
                }
            }

            break;
    }
};

/**
 * Move the suggest selection
 * @param {boolean} onRight Move to the right?
 */
twic.vcl.Suggest.prototype.move_ = function(onRight) {
    var
        selectedElement = this.getSelectedElement_(),
        trg = null;

    if (selectedElement) {
        trg = onRight ? selectedElement.nextElementSibling : selectedElement.previousElementSibling;
    }

    if (!selectedElement
        || !trg
    ) {
        trg = onRight ? this.nickList_.firstElementChild : this.nickList_.lastElementChild;
    }

    if (selectedElement) {
        selectedElement.classList.remove('selected');
    }

    if (trg) {
        trg.classList.add('selected');
    }
};

/**
 * Handle the focus event
 * @private
 */
twic.vcl.Suggest.prototype.focus_ = function() {
    this.focused_ = true;
    this.move_(true);
};

/**
 * Remove the suggest box
 * @private
 */
twic.vcl.Suggest.prototype.remove_ = function() {
    twic.dom.setVisibility(this.nickList_, false);
    this.nickList_.innerHTML = '';
    this.visible_ = false;
    this.focused_ = false;
    this.part_ = '';
};

twic.vcl.Suggest.prototype.select_ = function() {
    var
        selectedElement = this.getSelectedElement_(),
        nickPart = this.extractNickPart_(),
        val = this.textarea_.value;

    if (!nickPart.success) {
        this.remove_();
        return false;
    }

    var
        selectedNick = selectedElement.innerText;

    this.textarea_.value = val.substring(0, nickPart.beg) + '@' + selectedNick + val.substring(nickPart.end);
    this.textarea_.selectionEnd = this.textarea_.selectionStart = nickPart.beg + selectedNick.length + 1;

    this.onSelect();

    this.remove_();
};

twic.vcl.Suggest.prototype.buildList_ = function(data, len) {
    var
        nickBuffer = document.createDocumentFragment(),
        el, i;

    for (i = 0; i < data.length; ++i) {
        var
            nick = data[i];

        el = twic.dom.expandElement('li');
        el.innerHTML = '<u>' + nick.substr(0, len) + '</u>' + nick.substr(len);
        nickBuffer.appendChild(el);
    }

    this.nickList_.innerHTML = '';
    this.nickList_.appendChild(nickBuffer);

    twic.dom.setVisibility(this.nickList_, true);
    this.visible_ = true;
    this.focused_ = false;
};

twic.vcl.Suggest.prototype.extractNickPart_ = function() {
    var
        val = this.textarea_.value,
        valLen = val.length,
        pos = this.textarea_.selectionEnd - 1,
        startPos = pos,
        nickChar = '',
        nickPart = '',
        res = {
            beg: 0,
            end: valLen,
            success: false,
            part: ''
        };

    while (pos > -1
        && '@' !== nickChar
        && ' ' !== nickChar
    ) {
        res.beg = pos;

        nickChar = val.substr(pos--, 1);
        nickPart = nickChar + nickPart;
    }

    if (pos > 0
        && ' ' !== val.substr(pos, 1)
    ) {
        return res;
    }

    if (0 === nickPart.length
        || '@' !== nickPart.substr(0, 1)
    ) {
        return res;
    }

    pos = startPos + 1;
    nickChar = '';

    while (pos < valLen && ' ' !== nickChar) {
        res.end = pos;

        nickChar = val.substr(pos++, 1);
        nickPart += nickChar;
    }

    nickPart = nickPart.trim();

    if ('@' === nickPart) {
        return res;
    }

    res.success = true;
    res.part = nickPart.substring(1).toLowerCase();

    return res;
};

twic.vcl.Suggest.prototype.check_ = function() {
    if (this.textarea_.selectionStart !== this.textarea_.selectionEnd) {
        if (this.visible_) {
            this.remove_();
        }

        return true;
    }

    var
        nickPart = this.extractNickPart_();

    if (!nickPart.success) {
        if (this.visible_) {
            this.remove_();
        }

        return true;
    }

    var
        suggest = this;

    if (this.part_ !== nickPart.part) {
        this.editor_.onGetSuggestList.call(this.editor_, nickPart.part, function(data) {
            if (0 === data.length) {
                if (suggest.visible_) {
                    suggest.remove_();
                }

                return true;
            }

            suggest.buildList_(data, nickPart.part.length);
            suggest.part_ = nickPart.part;
        } );
    }
};

twic.vcl.Suggest.prototype.onSelect = function() { };
