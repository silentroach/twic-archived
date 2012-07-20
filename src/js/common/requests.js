/**
 * Handle crosspage extension messaging
 *
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

twic.requests = { };

/**
 * @type {Object.<string, Array>}
 * @private
 */
twic.requests.subscriptions_ = { };

/**
 * Send data to background
 * @param {string} method Method name
 * @param {Object} data Data to send
 * @param {function(*)=} callback Callback function
 */
twic.requests.makeRequest = function(method, data, callback) {
    chrome.extension.sendRequest( {
        'method': method,
        'data': data
    }, function(reply) {
        if (callback) {
            callback(reply);
        }
    } );
};

/**
 * Subscribe to the event
 * @param {string} event Event
 * @param {function(Object, function(Object))} callback Callback function
 */
twic.requests.subscribe = function(event, callback) {
    if (!twic.requests.subscriptions_[event]) {
        twic.requests.subscriptions_[event] = [];
    }

    twic.debug.info('subscribe for ' + event);

    twic.requests.subscriptions_[event].push(callback);
};

twic.requests.handle = function(request, sender, sendResponse) {
    var
        method = request['method'],
        subscription = twic.requests.subscriptions_[method],
        i;

    if (method
        && subscription
    ) {
        for (i = 0; i < subscription.length; ++i) {
            subscription[i](
                request['data'] || {},
                sendResponse
            );
        }
    } else {
        sendResponse({});

        twic.debug.groupCollapsed('failed request received');
        twic.debug.error('failed or handler not found');
        twic.debug.dir(request);
        twic.debug.groupEnd();
    }
};

