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

	return {
		length: length
	};

} )(twic);
