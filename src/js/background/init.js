/**
 * Init for background
 *
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

( function() {
	var
		/** @const **/ cleanupMarkItem = 'lastCleanup',
		/** @const **/ configCheckItem = 'lastConfigCheck',
		dirtyDate  = (new Date()).toJSON().split('T')[0],
		lastCleanupDate = window.localStorage.getItem(cleanupMarkItem),
		lastConfigCheckDate = window.localStorage.getItem(configCheckItem);

	if (lastCleanupDate != dirtyDate) {
		window.localStorage.setItem(cleanupMarkItem, dirtyDate);

		twic.db.cleanup();
	}

	if (lastConfigCheckDate != dirtyDate) {
		window.localStorage.setItem(configCheckItem, dirtyDate);

		twic.twitter.checkConfig();
	}
}() );
