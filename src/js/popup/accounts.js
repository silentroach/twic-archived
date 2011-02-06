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

		console.dir(list);
	};
	
	document.getElementById('account_add').onclick = function() {
		t.requests.send('addAccount');
	};

	t.router.handle('accounts', function(data) {
		clearList();
		
		console.info('getaccountlist');
		t.requests.send('getAccountList', function(list) {
			console.dir(list);

			if (list) {
				buildList(list);
			}
		} );
	} );

} )(twic);
