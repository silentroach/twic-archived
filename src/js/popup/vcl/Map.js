/**
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

window['map_init'] = false;

/**
 * Map element
 * @constructor
 * @param {Element} container Container element
 */
twic.vcl.Map = function(container, lat, lng) {
	var drawMap = function() {
		container.style.display = 'block';

		new google.maps.Map(container, {
			'zoom': 13,
			'center': new google.maps.LatLng(lat, lng),
		  'mapTypeId': google.maps.MapTypeId.ROADMAP,
		  'streetViewControl': false
		} );
	};

	if (window['map_init']) {
		drawMap();
	} else {
		window['initMap'] = function() {
			window['map_init'] = true;
			drawMap();
		};

		twic.inject.js('https://maps-api-ssl.google.com/maps/api/js?v=3&sensor=false&callback=initMap');
	}
};
