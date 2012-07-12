/**
 * Omnibox functions
 *
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

chrome.omnibox.setDefaultSuggestion( {
    'description': twic.i18n.translate('omnibox_find_user', '@%s')
} );

chrome.omnibox.onInputEntered.addListener( function(text) {

    chrome.tabs.getSelected(null, function(tab) {
        chrome.tabs.update(tab.id, {
            'url': 'https://twitter.com/' +
                encodeURIComponent(text)
        } );
    } );

} );