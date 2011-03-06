/**
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

twic.router = ( function() {

	var
		self = { },
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
				frame.callbacks[i].call(self, data);
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

	self = {
		handle: function(frameName, callback) {
			frames[frameName].callbacks.push(callback);
		},

		// remember the page to open it next time popup is open
		remember: function() {
			// todo refactor
			var loc = window.location.hash.split('#');
			loc.shift();

			localStorage.setItem('location', loc.join('#'));
		}
	};

	return self;

}());
