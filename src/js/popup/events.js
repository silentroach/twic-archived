/**
 * Some event helpers
 *
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

twic.events = { };

/**
 * @param {MouseEvent} event Mouse event
 * @return {boolean}
 */
twic.events.isMouseEventAndModifier = function(event) {
	if (twic.platforms.OSX === twic.platform) {
		return event.metaKey;
	} else {
		return event.ctrlKey;
	}
};
