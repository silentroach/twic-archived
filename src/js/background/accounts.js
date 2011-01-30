twic.accounts = ( function(t) {

	var
		accounts = this,
		length = 0;
		
	t.db.readTransaction( function(tr) {
		tr.executeSql('select * from accounts', function(res) {
			console.dir(res);
		}, function(error) {
			console.dir(error);
		} );
	} );
	
	t.notifier.subscribe('addAccount', function(request, sendResponse) {
		sendResponse({});

		chrome.tabs.create( {
			'url': 'http://api.twitter.com/oauth/authorize?oauth_token=' + t.oauth.getToken()	
		} );
	} );

	return {
		length: length
	};

} )(twic);
