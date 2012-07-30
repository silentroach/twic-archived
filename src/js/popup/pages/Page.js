/**
 * Page base class
 *
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

twic.pages = { };

/**
 * @constructor
 */
twic.Page = function() {
    /**
     * Remember this page as last?
     * @type {boolean}
     */
    this.remember = false;

    /**
     * Page html element
     * @type {Element}
     * @protected
     */
    this.pageElement_ = null;
};

/**
 * Code to prepare page for the first time
 * @protected
 */
twic.Page.prototype.initOnce = function() { };

/**
 * Code to run on router handler
 * @param {Array.<string>} data Data from url
 */
twic.Page.prototype.handle = function(data) { };
