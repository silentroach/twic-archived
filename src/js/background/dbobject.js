twic.dbobject = {
	table: '',
	fields: [ ],
	values: { },

	loadByFieldValue: function(fieldname, value, callback) {
		twic.db.readTransaction( function(tr) {
			tr.executeSql('select ' + this.fields.join(',') + ' from ' + this.table + ' where ' + fieldname + ' = ?', [
				value
			], function(tr, res) {
				console.dir(res);

				callback();
			} );
		} );
	},

	loadById: function(id, callback) {
		return this.loadByFieldValue('id', id, callback);
	}
};
