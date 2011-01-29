twic.router = ( function(t) {

	var 
		/** @type {Object} */ frames = { },
		/** @type {string} */ currentFrame;
	
	var tmp = document.querySelectorAll('body > div');
	for (var i = 0; i < tmp.length; ++i) {
		var frame = tmp[i];
		frames[frame.id] = {
			frame: frame,
			callbacks: []
		};
	}
	
	// ----------------------------------------------------
	
	var changeFrame = function(targetFrameName, data) {
		if (currentFrame) {
			frames[currentFrame].frame.style.display = 'none';
		}
		
		var frame = frames[targetFrameName];
		
		if (frame) {
			for (var i = 0; i < frame.callbacks.length; ++i) {
				frame.callbacks[i](data);
			}
			
			frame.frame.style.display = 'block';
		}
	};
	
	var showFrame = function(frameName) {
		frames[frameName].frame.style.display = 'block';
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

} )(twic);
