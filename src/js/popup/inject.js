/**
 * Injector
 *
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

twic.inject = { };

/**
 * @type {Element}
 * @private
 */
twic.inject.headElement_ = null;

/**
 * @type {Object.<string,number>}
 * @private
 */
twic.inject.injected_ = { };

/**
 * @param {string} file Filename
 */
twic.inject.css = function(file) {
    var
        styleElement;

    if (file in twic.inject.injected_) {
        return false;
    } else {
        twic.inject.injected_[file] = 1;
    }

    if (!twic.inject.headElement_) {
        twic.inject.headElement_ = twic.dom.findElement('head');
    }

    styleElement = twic.dom.create('link');
    twic.dom.attrs(styleElement, {
        'rel': 'stylesheet',
        'type': 'text/css',
        'href': file
    } );

    twic.inject.headElement_.appendChild(styleElement);
};

/**
 * @param {string} file Filename
 * @param {function()=} callback Callback
 */
twic.inject.js = function(file, callback) {
    var
        scriptElement;

    if (file in twic.inject.injected_) {
        if (callback) {
            callback();
        }

        return false;
    } else {
        twic.inject.injected_[file] = 1;
    }

    scriptElement = twic.dom.create('script');

    if (callback) {
        scriptElement.onload = callback;
    }

    twic.dom.attr(scriptElement, 'src', file);

    document.body.appendChild(scriptElement);
};
