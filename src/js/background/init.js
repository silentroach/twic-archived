( function(t) {

	var req = new t.request('POST', 'https://twitter.com/oauth/request_token');
	
	t.oauth.sign(req);
	
	req.send( function(req) {
		console.dir(req);
	} );

} )(twic);
