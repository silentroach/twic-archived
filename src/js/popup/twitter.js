/**
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */
 
// FIXME deprecated

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
			/(@(\w*)(\/\w+)?)/i,
			function(nick) {
				var n = nick.substring(1);

				return '<a class="nick" href="#profile#' + n.toLowerCase() + '">@' + n + '</a>';
			}
		);

		// preparing hashtags
		txt = txt.replace(
			/(^|\s)#(\w+)/g,
			'$1<a class="hash" target="_blank" href="http://search.twitter.com/search?q=%23$2">#$2</a>'
		);

		// preparing line breaks
		txt = txt.replace(
			/\r?\n/,
			'<br />'
		);

		return txt;
	};

	return {
		parseTweet: parseTweet
	};

}());
