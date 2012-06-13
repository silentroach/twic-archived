/**
 * Some event helpers
 *
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

twic.events = { };

/**
 * @param {MouseEvent|KeyboardEvent} event Mouse or keyboard event
 * @return {boolean}
 */
twic.events.isEventWithModifier = function(event) {
    if (twic.platforms.OSX === twic.platform) {
        return event.metaKey;
    } else {
        return event.ctrlKey;
    }
};
