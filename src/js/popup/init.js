/**
 * Init script for popup
 *
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

// some handlers

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
			attr = link.getAttribute('href'),
			trg  = link.getAttribute('target');

		if (
			attr
			&& '_blank' === trg
		) {
			e.preventDefault();

			chrome.tabs.create( {
				'url': attr,
				// only select the new tab if left button is pressed
				'selected': 0 === e.button
			} );

			if (
				0 === e.button
				&& !e.metaKey
			) {
				// left button click, closing the window, special for os x
				window.close();
			}
		}
	}
}, false);

// register pages

twic.router.register('profile', twic.pages.ProfilePage);
twic.router.register('accounts', twic.pages.AccountsPage);
twic.router.register('timeline', twic.pages.HomeTimelinePage);
twic.router.register('mentions', twic.pages.MentionsPage);
//twic.router.register('conversation', twic.pages.ConversationPage);
twic.router.register('about', twic.pages.AboutPage);
