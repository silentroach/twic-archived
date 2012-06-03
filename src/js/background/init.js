/**
 * Init for background
 *
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

( function() {
    var
        nowDate = (new Date()).toDateString(),
        cleanupMarkItem = 'lastCleanup',
        configCheckItem = 'lastConfigCheck';

    if (nowDate !== window.localStorage.getItem(cleanupMarkItem)) {
        window.localStorage.setItem(cleanupMarkItem, nowDate);

        twic.db.cleanup();
    }

    if (nowDate !== window.localStorage.getItem(configCheckItem)) {
        window.localStorage.setItem(configCheckItem, nowDate);

        twic.twitter.checkConfig();
    }
}() );
