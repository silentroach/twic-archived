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
		// @resource css/inject/av_32.css
		twic.style.inject('css/inject/av_32.css');
	}
} );
