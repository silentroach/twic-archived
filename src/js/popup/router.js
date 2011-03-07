/**
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

twic.router = ( function() {

	var
		self = { },
		/** @type {Object} */ frames = { },
		/** @type {string} */ currentFrame,
		/** @type {Array.<string>} */ location = [],
		/** @type {Array.<string>} */ previousLocation = [],
		i;

	var tmp = document.querySelectorAll('body > div');
	for (i = 0; i < tmp.length; ++i) {
		var frame = tmp[i];
		frames[frame.id] = {
			frame: frame,
			callbacks: [],
			init: false
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
			currentFrame = targetFrameName;

			for (i = 0; i < frame.callbacks.length; ++i) {
				frame.callbacks[i].call(self, data);
			}

			frame.frame.style.display = 'block';
		}
	};

	// ----------------------------------------------------

	window.onhashchange = function() {
		// store the previous location
		previousLocation = location;

		location = window.location.hash.split('#');
		location.shift();

		var trg = location[0];

		if (
			trg
			&& currentFrame !== trg
			&& frames[trg]
		) {
			changeFrame(trg, location.slice(1));
		}
	};

	self = {
		handle: function(frameName, callback) {
			frames[frameName].callbacks.push(callback);
		},

		previous: function() {
			return previousLocation;
		},

		/**
		 * init the page for the first time
		 * @param {function()}
		 */
		init: function(callback) {
			if (
				!frames[currentFrame]
				|| frames[currentFrame].init
			) {
				return;
			}

			frames[currentFrame].init = true;
			callback();
		},

		// remember the page to open it next time popup is open
		remember: function() {
			localStorage.setItem('location', location.join('#'));
		}
	};

	return self;

}());
