/**
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

/**
 * Map element
 * @constructor
 * @param {Element} container Container element
 */
twic.vcl.Map = function(container) {
	var
		map = this;
		
	if (!twic.vcl.Map.scriptLoaded) {
		var 
			firstScript = twic.dom.findElement('script'),
			newScript = twic.dom.expandElement('script');
			
		newScript.src = 'http://maps.google.com/maps/api/js?sensor=false';
		
		firstScript.parentNode.insertBefore(newScript, firstScript);
		
		twic.vcl.Map.scriptLoaded = true;
	}
};

twic.vcl.Map.scriptLoaded = false;
