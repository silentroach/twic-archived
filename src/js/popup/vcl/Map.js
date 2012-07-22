/**
 * Some time ago there was dynamic gmaps, but with CSP for now (jule 2012) it is impossible
 *
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
        mapImage = twic.dom.expandElement('img'),
        srcArr = ['https://maps.google.com/maps/api/staticmap?'],
        data = {
            'sensor': 'false',
            'zoom': 13,
            'size': '380x200',
            'maptype': 'roadmap',
            'center': [lat,lng].join(',')
        }, i;

    for (i in data) {
        srcArr.push(encodeURIComponent(i) + '=' + encodeURIComponent(data[i]));
    }

    mapImage.src = srcArr.join('&');

    container.appendChild(mapImage);

};
