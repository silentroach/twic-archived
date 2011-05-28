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
