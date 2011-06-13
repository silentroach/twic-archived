/**
 * Options page translation
 *
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

( function() {

	twic.dom.findElement('title').innerText = twic.utils.lang.translate('options_title');

	twic.dom.findElement('#tabs li[data-content=ui] span').innerText = twic.utils.lang.translate('options_ui_title');
	twic.dom.findElement('span.desc[data-key=avatar_size]').innerText = twic.utils.lang.translate('options_ui_avsize_title');

	twic.dom.findElement('span[data-desc=tweet]').innerText = twic.utils.lang.translate('options_tweet');

	twic.dom.findElement('label[for=tweet_show_time]').innerText = twic.utils.lang.translate('options_tweet_show_time');
	twic.dom.findElement('label[for=tweet_show_client]').innerText = twic.utils.lang.translate('options_tweet_show_client');

}() );
