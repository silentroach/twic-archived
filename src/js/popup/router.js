/**
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

twic.router = ( function() {

	var
		/** @type {Object} */ frames = { },
		/** @type {string} */ currentFrame,
		i;

	var tmp = document.querySelectorAll('body > div');
	for (i = 0; i < tmp.length; ++i) {
		var frame = tmp[i];
		frames[frame.id] = {
			frame: frame,
			callbacks: []
		};
	}

	// ----------------------------------------------------

	var changeFrame = function(targetFrameName, data) {
		var
			frame,
			i;

		if (currentFrame) {
			frames[currentFrame].frame.style.display = 'none';
		}

		frame = frames[targetFrameName];

		if (frame) {
			for (i = 0; i < frame.callbacks.length; ++i) {
				frame.callbacks[i](data);
			}

			frame.frame.style.display = 'block';

			currentFrame = targetFrameName;
		}
	};

	// ----------------------------------------------------

	window.onhashchange = function() {
		var loc = window.location.hash.split('#');
		loc.shift();

		var trg = loc.shift();

		if (
			trg
			&& currentFrame !== trg
			&& frames[trg]
		) {
			changeFrame(trg, loc);
		}
	};

	return {
		handle: function(frameName, callback) {
			frames[frameName].callbacks.push(callback);
		}
	};

}());
