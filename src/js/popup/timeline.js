/**
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

( function() {

  var
	  /** @type {HTMLUListElement} */ list = document.querySelector('#timeline ul');

  var buildList = function(list) {
	console.dir(list);
  };

  twic.router.handle('timeline', function(data) {
	  if (
		  !data.length
		  || 1 !== data.length
	  ) {
		  return;
	  }

	  var id = data[0];

	  twic.requests.send('getTimeline', {
		  'id': id
	  }, function(list) {
		  if (list) {
			  buildList(list);
		  }
	  } );
  } );

} )();
