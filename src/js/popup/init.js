/**
 * Init script for popup
 *
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

// try to switch to the page we remember before popup was closed
var lastLocation = window.localStorage.getItem('location');

if (lastLocation) {
	// go to the previous remembered location
	window.location = window.location.pathname + '#' + lastLocation;
}

window.onhashchange();
