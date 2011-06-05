/**
 * Init script for popup
 *
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

setTimeout( function() {

	// try to switch to the page we remember before popup was closed
	var lastLocation = window.localStorage.getItem('location');

	if (lastLocation) {
		twic.debug.info('Last stored location:', lastLocation);

		// go to the previous remembered location
		window.location = window.location.pathname + '#' + lastLocation;
	}

	window.onhashchange();

}, 100 );

// handling clicks on links with "data-url" property
// special hack to allow users to open links in
// background with middle mouse click (or with metaKey + click in MacOS)
document.addEventListener('click', function(e) {
	var
		link = 'A' === e.target.nodeName
			? e.target
			: e.target.parentElement && 'A' === e.target.parentElement.nodeName
				? e.target.parentElement
				: null;

	if (
		link
		// only for left and middle mouse buttons
		&& e.button < 2
	) {
		var
			attr = link.attributes.getNamedItem('data-url');

		if (attr) {
			if (
				1 === e.button
				|| e.metaKey
			) {
				// middle button click
				e.preventDefault();
			}

			chrome.tabs.create( {
				'url': attr.value,
				// only select the new tab if left button is pressed
				'selected': 0 === e.button
			} );

			if (
				0 === e.button
				&& !e.metaKey
			) {
				// left button click, closing the window, special for macos
				window.close();
			}
		}
	}
}, false);

/*
( function() {

	var
		wrapper = document.getElementById('wrapper');

	var reheight = function() {
		var newHeight = (screen.availHeight - window.screenTop - 70) + 'px';

		if (newHeight !== wrapper.style.maxHeight) {
			wrapper.style.maxHeight = newHeight;
		}
	};

	// ugly thing to recalculate the max page height
	setInterval( reheight, 1000 );
	setTimeout( reheight, 200 );

}() );
*/
