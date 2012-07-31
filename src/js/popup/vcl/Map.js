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
        i,
        coords = [lat,lng].join(','),
        mapLink = twic.dom.create('a'),
        mapLinkSrc = ['https://maps.google.com/maps?'],
        mapLinkSrcData = {
            'll': coords,
            'z': 13
        },

        mapImage = twic.dom.create('img'),
        mapImageSrc = ['https://maps.google.com/maps/api/staticmap?'],
        mapImageSrcData = {
            'sensor': 'false',
            'zoom': 13,
            'size': '380x200',
            'maptype': 'roadmap',
            'center': coords,
            'language': chrome.app.getDetails().current_locale
        };

    for (i in mapLinkSrcData) {
        mapLinkSrc.push(encodeURIComponent(i) + '=' + encodeURIComponent(mapLinkSrcData[i]));
    }

    for (i in mapImageSrcData) {
        mapImageSrc.push(encodeURIComponent(i) + '=' + encodeURIComponent(mapImageSrcData[i]));
    }

    twic.dom.attrs(mapLink, {
        'href': mapLinkSrc.join('&'),
        'target': '_blank'
    } );
    twic.dom.attr(mapImage, 'src', mapImageSrc.join('&'));

    mapLink.appendChild(mapImage);
    container.appendChild(mapLink);

};
