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

    // TODO drop this shit after stable Chrome 22
    var
        version = navigator.appVersion.match(/Chrome\/(\d+)/);

    if (2 === version.length &&
        parseInt(version.pop(), 10) < 21
    ) {
        twic.dom.addClass(document.body, 'rounded');
    }
} else
if (navigator.appVersion.indexOf('Windows') < 0) {
    twic.platform = twic.platforms.LINUX;
}

twic.dom.addClass(document.body, twic.platform);
