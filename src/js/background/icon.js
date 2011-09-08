/**
 * Drawing the icon for browser action
 *
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */
( function() {

	var
		icon = document.createElement('canvas'),
		ctx  = icon.etContext('2d');

	icon.setAttribute('width', '19px');
	icon.setAttribute('height', '19px');

	ctx.font = 'bold 23px Tahoma';
	ctx.textBaseline = 'middle';
	ctx.fillText('t', 5, 8);

	chrome.browserAction.setIcon( {
		'imageData': ctx.getImageData(0, 0, 19, 19)
	} );

}() );
