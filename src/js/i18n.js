/**
 * Language utils
 *
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

 twic.i18n = { };

 /**
 * Translate the message
 * @param {...*} args
 */
twic.i18n.translate = function(args) {
    return chrome.i18n.getMessage.apply(chrome, arguments);
};

/**
 * Plural form
 * (яблоко, яблока, яблок)
 * @param {number} number Number
 * @param {Array.<string>} endings Translate aliases to endings
 */
twic.i18n.plural = function(number, endings) {
    var
        mod10  = number % 10,
        mod100 = number % 100,
        res = '';

    if (mod10 === 1
        && mod100 !== 11
    ) {
        res = twic.i18n.translate(endings[0]);
    } else
    if (mod10 >= 2
        && mod10 <= 4
        && (mod100 < 10
            || mod100 >= 20
        )
    ) {
        res = twic.i18n.translate(endings[1]);
    } else {
        res = twic.i18n.translate(endings[2]);
    }

    return number + ' ' + res;
};