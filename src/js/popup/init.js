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

document.addEventListener('click', function(e) {
	if (
		// only for left and middle mouse buttons
		e.button < 2
		&& 'A' === e.target.nodeName
	) {
		var
			attr = e.target.attributes.getNamedItem('data-url');
			
		if (attr) {
			if (
				1 === e.button
				|| e.ctrlKey
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
				&& !e.ctrlKey
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
