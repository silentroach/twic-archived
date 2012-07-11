/**
 * Platform detector
 *
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

/**
 * Platforms
 * @enum {string}
 */
twic.platforms = {
    WINDOWS: 'windows',
    OSX:     'osx',
    LINUX:   'linux'
};

/**
 * @type {twic.platforms}
 */
twic.platform = twic.platforms.WINDOWS;

if (navigator.appVersion.indexOf('Mac') >= 0) {
    twic.platform = twic.platforms.OSX;

    twic.dom.addClass(document.body, twic.platform);
} else
if (navigator.appVersion.indexOf('Windows') < 0) {
    twic.platform = twic.platforms.LINUX;
}

twic.dom.addClass(document.body, twic.platform);
