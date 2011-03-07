/**
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

var twic = twic || { };

twic.twitter = (function() {

	var
		/** @type {RegExp} */ urlPattern = /^https?:\/\/(www\.)?([^\/]+)?/i;

	var parseTweet = function(text) {
		// preparing urls
		var txt = text.replace(
			/[A-Za-z]+:\/\/[A-Za-z0-9-_]+\.[A-Za-z0-9-_:%&\?\/.=]+/g,
			function(url) {
				var
					stripped = url,
					parsed = urlPattern.exec(url);

				if (
					parsed
					&& parsed.length > 2
				) {
					stripped = parsed[2];
				} else
				if (stripped.length > 30) {
					stripped = stripped.substring(0, 30) + '&hellip;';
				}

				return '<a target="_blank" href="' + url + '" title="' + url + '">' + stripped + '</a>';
			}
		);

		// preparing nicks
		txt = txt.replace(
			/(^|\s)@(\w+)/g,
			function(nick) {
				var n = nick.substring(2);

				return nick[0] + '<a class="nick" href="#profile#' + n.toLowerCase() + '">@' + n + '</a>';
			}
		);

		// preparing hashtags
		txt = txt.replace(
			/(^|\s)#(\w+)/g,
			'$1<a class="hash" target="_blank" href="http://search.twitter.com/search?q=%23$2">#$2</a>'
		);

		return txt;
	};

	return {
		parseTweet: parseTweet
	};

}());

if (twic.debug.ENABLED) {
	exports.twitter = twic.twitter;
}
