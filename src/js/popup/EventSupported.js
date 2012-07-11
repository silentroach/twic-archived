/**
 * Event handler
 *
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

/**
 * @constructor
 */
twic.EventSupported = function() {

    /**
     * @private
     */
    this.listeners_ = { };

};

/**
 * Add event listener
 */
twic.EventSupported.prototype.addEventListener = function(eventName, callback) {
    if ('undefined' === typeof this.listeners_[eventName]) {
        this.listeners_[eventName] = [];
    }

    this.listeners_[eventName].push(callback);
};

/**
 * Trigger some event
 * @protected
 */
twic.EventSupported.prototype.triggerEvent_ = function(eventName, scope) {
    var
        self = this,
        i;

    if ('undefined' === typeof self.listeners_[eventName]) {
        return false;
    }

    for (i = 0; i < self.listeners_[eventName].length; ++i) {
        self.listeners_[eventName][i].call(scope || self);
    }
};