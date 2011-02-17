( function(t) {

	var
		/** @type {HTMLUListElement} */ list = document.querySelector('#timeline ul');
		
	t.router.handle('timeline', function(data) {
		console.dir(data);
	} );		

} )(twic);