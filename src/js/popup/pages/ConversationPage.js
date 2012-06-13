/**
 * Conversation page implementation
 *
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

/**
 * @constructor
 * @extends twic.pages.TimelinePage
 */
twic.pages.ConversationPage = function() {
    twic.pages.TimelinePage.call(this);

    /**
     * Base tweet id to show the conversation
     */
    this.baseTweetId_ = null;
};

goog.inherits(twic.pages.ConversationPage, twic.pages.TimelinePage);
