/**
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

var lastLocation = localStorage.getItem('location');

if (lastLocation) {
	// go to the previous remembered location
	location = location.pathname + '#' + lastLocation;
}

window.onhashchange();
