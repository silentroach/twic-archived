/**
 * Init for background
 *
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

( function() {
    var
        nowDate = (new Date()).toDateString(),
        storage = window.localStorage,
        cleanupMarkItem = 'lastCleanup',
        configCheckItem = 'lastConfigCheck';

    if (nowDate !== storage.getItem(cleanupMarkItem)) {
        storage.setItem(cleanupMarkItem, nowDate);

        twic.db.cleanup();
    }

    if (nowDate !== storage.getItem(configCheckItem)) {
        storage.setItem(configCheckItem, nowDate);

        twic.twitter.checkConfig();
    }
}() );
