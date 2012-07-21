/**
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

/**
 * Map element
 * @constructor
 * @param {Element} container Container element
 * @param {number} lat Latitude
 * @param {number} lng Longitude
 */
twic.vcl.Map = function(container, lat, lng) {

    var
        map = this;

    /**
     * @type {Element}
     * @private
     */
    map.container_ = container;

    /**
     * @type {number}
     * @private
     */
    map.lat_ = lat;

    /**
     * @type {number}
     * @private
     */
    map.lng_ = lng;

    twic.inject.js(
        'https://api-maps.yandex.ru/2.0/?load=package.full&lang='
        + chrome.app.getDetails().current_locale,
        function() {
            ymaps.ready( function() {
                map.drawMap_.call(map);
            } );
        }
    );
};

/**
 * Draw the map
 * @private
 */
twic.vcl.Map.prototype.drawMap_ = function() {
    var
        map = this,
        ymap;

    ymap = new ymaps.Map(
        map.container_, {
            center: [map.lat_, map.lng_],
            zoom: 4
        }
    );

    twic.dom.show(map.container_);

    /*
    var
        map = this,
        coords = new google.maps.LatLng(map.lat_, map.lng_),
        gmap, gmarker;

    twic.dom.show(map.container_);

    gmap = new google.maps.Map(map.container_, {
        'zoom': 13,
        'center': coords,
        'mapTypeId': google.maps.MapTypeId.ROADMAP,
        'streetViewControl': false
    } ),

    gmarker = new google.maps.Marker( {
        'map': map,
        'position': coords,
        // @resource img/marker_map.gif
        'icon': '/img/marker_map.gif'
    } );
    */
};
