/**
 * Init for options
 *
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

twic.options.get('avatar_size', function(tmpVal) {
	var
		avSize = parseInt(tmpVal, 10);

	if (32 === avSize) {
		twic.vcl.Timeline.options.avatarSizeDefault = false;
	}
} );

twic.options.get('tweet_show_time', function(value) {
	twic.vcl.Timeline.options.showTime = value;
} );

twic.options.get('tweet_show_time_link', function(value) {
	twic.vcl.Timeline.options.showTimeAsLink = value;
} );

twic.options.get('short_url_length', function(value) {
	twic.vcl.TweetEditor.options.short_url_length = parseInt(value, 10);
} );

twic.options.get('short_url_length_https', function(value) {
	twic.vcl.TweetEditor.options.short_url_length_https = parseInt(value, 10);
} );
