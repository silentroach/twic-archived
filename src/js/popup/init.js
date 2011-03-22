/**
 * Init script for popup
 *
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

// try to switch to the page we remember before popup was closed
var lastLocation = localStorage.getItem('location');

if (lastLocation) {
	// go to the previous remembered location
	location = location.pathname + '#' + lastLocation;
}

window.onhashchange();

