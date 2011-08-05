/**
 * Router object
 * Handle page switching in popup
 *
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

twic.router = { };

/**
 * @type {Array.<string>}
 * @private
 */
twic.router.location_ = [];

/**
 * @type {Object.<string, Element>}
 * @private
 */
twic.router.frames_ = ( function() {
	var
		tmp = document.querySelectorAll('div.page'),
		res = { },
		i;
	
	for (i = 0; i < tmp.length; ++i) {
		var frame = tmp[i];

		res[frame.id] = frame;
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
twic.router.previousLocation_ = [];

/**
 * Initialized pages
 * @private
 * @type {Object.<string, twic.Page}
 */
twic.router.pages_ = { };

/**
 * Router handlers
 * @private
 * @type {Object.<string, function()}
 */
twic.router.handlers_ = { };

/**
 * Get the previous frame names
 * @return {Array.<string>}
 */
twic.router.previous = function() {
	return twic.router.previousLocation_;
};

/**
 * Register the page with url part
 * @param {string} urlPart Url part
 * @param {function()} pageCtor Page constructor
 */
twic.router.register = function(urlPart, pageCtor) {
	twic.router.handlers_[urlPart] = pageCtor;
};

/**
 * Change the frame
 * @private
 * @param {string} targetFrameName Target frame names
 * @param {Array.<string>} data Data from url
 */
twic.router.changeFrame_ = function(targetFrameName, data) {
	var
		page = null;
	
	if (twic.router.currentFrame_) {
		twic.dom.setVisibility(twic.router.frames_[twic.router.currentFrame_], false);
	}

	twic.router.currentFrame_ = targetFrameName;
	
	if (!(targetFrameName in twic.router.pages_)) {
		page = new twic.router.handlers_[targetFrameName]();
		page.initOnce();
		
		twic.router.pages_[targetFrameName] = page;
	} else {
		page = twic.router.pages_[targetFrameName];
	}

	twic.router.frames_[targetFrameName].style.display = 'block';
	page.handle.call(page, data);
};

// -------------------------------------------------------------------

window.onhashchange = function() {
	// store the previous location
	twic.router.previousLocation_ = twic.router.location_;

	twic.router.location_ = window.location.hash.split('#');
	twic.router.location_.shift();

	var trg = twic.router.location_[0];

	if (
		trg
		&& twic.router.currentFrame_ !== trg
		&& trg in twic.router.handlers_
	) {
		twic.router.changeFrame_(trg, twic.router.location_.slice(1));
	}
};

/**
 * @type {Object}
 * @private
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



 * @param {string} frameName Frame names
 * @param {function()} callback Callback function
twic.router.handle = function(frameName, callback) {
	twic.router.frames_[frameName].callbacks.push(callback);
};

 * Get the previous frame names
 * @return {Array.<string>}
twic.router.previous = function() {
	return twic.router.previousLocation_;
};

 * init the page for the first time
 * @param {function()} callback
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

 * Remember the page to open it next time popup is open
twic.router.remember = function() {
	window.localStorage.setItem('location', twic.router.location_.join('#'));
};
*/

