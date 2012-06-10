/**
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

/**
 * Map element
 * @constructor
 * @param {Element} container Container element
 */
twic.vcl.Map = function(container, lat, lng) {
    var drawMap = function() {
        container.style.display = 'block';

        var
            latLng = new google.maps.LatLng(lat, lng),
            map = new google.maps.Map(container, {
                'zoom': 13,
                'center': latLng,
                'mapTypeId': google.maps.MapTypeId.ROADMAP,
                'streetViewControl': false
            } ),
            marker = new google.maps.Marker( {
                'map': map,
                'position': latLng,
                // @resource img/marker_map.gif
                'icon': '/img/marker_map.gif'
            } );
    };

    twic.inject.js(
        'https://maps.googleapis.com/maps/api/js?sensor=false&language='
        + chrome.app.getDetails().current_locale,
        drawMap
    );
};
