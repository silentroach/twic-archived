/**
 * Router object
 * Handle page switching in popup
 *
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

twic.router = { };

/**
 * @type {Object}
 * @private
 */
twic.router.frames_ = ( function() {
	var
		tmp = document.querySelectorAll('div.page'),
		res = { },
		i;

	for (i = 0; i < tmp.length; ++i) {
		var frame = tmp[i];

		res[frame.id] = {
			frame: frame,
			callbacks: [],
			init: false
		};
	}

	return res;
}() );

/**
 * @type {string}
 * @private
 */
twic.router.currentFrame_ = '';

/**
 * @type {Array.<string>}
 * @private
 */
twic.router.location_ = [];

/**
 * @type {Array.<string>}
 * @private
 */
twic.router.previousLocation_ = [];

// ----------------------------------------------------

/**
 * Change the frame
 * @param {string} targetFrameName Target frame names
 * @param {Array.<string>} data Data from url
 */
twic.router.changeFrame_ = function(targetFrameName, data) {
	var
		frame = twic.router.frames_[targetFrameName],
		i;

	if (twic.router.currentFrame_) {
		twic.dom.setVisibility(twic.router.frames_[twic.router.currentFrame_].frame, false);
	}

	if (frame) {
		twic.router.currentFrame_ = targetFrameName;

		for (i = 0; i < frame.callbacks.length; ++i) {
			frame.callbacks[i](data);
		}

		frame.frame.style.display = 'block';
	} else {
		console.error('Frame ' + targetFrameName + ' not found');
	}
};

// ----------------------------------------------------

window.onhashchange = function() {
	// store the previous location
	twic.router.previousLocation_ = twic.router.location_;

	twic.router.location_ = window.location.hash.split('#');
	twic.router.location_.shift();

	var trg = twic.router.location_[0];

	if (
		trg
		&& twic.router.currentFrame_ !== trg
		&& twic.router.frames_[trg]
	) {
		twic.router.changeFrame_(trg, twic.router.location_.slice(1));
	}
};

/**
 * @param {string} frameName Frame names
 * @param {function()} callback Callback function
 */
twic.router.handle = function(frameName, callback) {
	twic.router.frames_[frameName].callbacks.push(callback);
};

/**
 * Get the previous frame names
 * @return {Array.<string>}
 */
twic.router.previous = function() {
	return twic.router.previousLocation_;
};

/**
 * init the page for the first time
 * @param {function()} callback
 */
twic.router.initOnce = function(callback) {
	if (
		!twic.router.frames_[twic.router.currentFrame_]
		|| twic.router.frames_[twic.router.currentFrame_].init
	) {
		return;
	}

	twic.router.frames_[twic.router.currentFrame_].init = true;
	callback();
};

/**
 * Remember the page to open it next time popup is open
 */
twic.router.remember = function() {
	window.localStorage.setItem('location', twic.router.location_.join('#'));
};

