( function(t) {

	var
		/** @type {HTMLUListElement} */ list = document.querySelector('#accounts ul');
		
	var clearList = function() {
		list.innerHTML = '';
	};
	
	var buildList = function(list) {
		if (list.length == 0) {
			return;
		}
	};

	t.router.handle('accounts', function(data) {
		clearList();
		
		t.requests.send('getAccountList', function(list) {
			if (list) {
				buildList(list);
			}
		} );
	} );

} )(twic);
