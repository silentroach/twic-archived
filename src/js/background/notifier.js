/**
 * Notifications
 *
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */
 
twic.notifier = { };

/**
 * @param {string} title Title
 * @param {string} description Description
 */
twic.notifier.show = function(title, description) {
    var
        notification = webkitNotifications.createNotification(
            // @resource img/icons/48.png
            '/img/icons/48.png',
            title,
            description
        );
        
    notification.show();
    
    // hide it after 5 seconds
    
    setTimeout( function() {
        if (notification) {
            notification.cancel();
        }
    }, 5000 );
};
