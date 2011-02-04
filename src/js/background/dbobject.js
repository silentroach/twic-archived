twic.dbobject = function() {
	this.table = '';
	this.fields = { };
	this.jsonMap = { };
	
	this.exists = false;
}

twic.dbobject.prototype.loadFromJSON = function(obj) {
	for (var key in this.fields) {
		var fld = key;
	
		if (key in this.jsonMap) {
			if (typeof this.jsonMap[key] == 'string') {
				fld = this.jsonMap[key];
			} else {
				this.setValue(key, this.jsonMap[key](obj));
				continue;
			}
		};
		
		if (fld in obj) {
			this.setValue(key, obj[fld]);
		};
	};
};

twic.dbobject.prototype.save = function() {
	var 
		fld = [],
		params = [],
		vals = [],
		sql = '';
	
	for (var key in this.fields) {	
		if (key == 'id') {
			continue;
		}
	
		fld.push(key);
		params.push('?');
		vals.push(this.fields[key]);
	}
	
	vals.push(this.fields['id']);
	
	sql += this.exists ? 'update ' : 'insert into ';
	sql += this.table + ' ';
	
	if (this.exists) {
		var setters = [];
	
		for (var i = 0; i < fld.length; ++i) {
			setters.push(fld[i] + ' = ?');
		}
	
		sql += 'set ' + setters.join(',') + ' where id = ?';
	} else {
		sql += '(' + fld.join(',') + ',id) select ' + params.join(',') + ', ?';
	}
	
	console.info(sql);
	
	twic.db.transaction( function(tr) {
		tr.executeSql(sql, vals);
	} );
};

twic.dbobject.prototype.setValue = function(fieldname, value) {
	if (fieldname in this.fields) {
		this.fields[fieldname] = value;
	}
};

twic.dbobject.prototype.setValueMapped = function(obj, map) {
	for (var key in map) {
		var el = map[key];
		
		if (el in obj) {
			this.setValue(key, obj[el]);
		}
	}
};

twic.dbobject.prototype.loadByFieldValue = function(fieldname, value, callback, nfcallback) {
	var 
		obj = this,
		fld = [];
	
	for (var key in obj.fields) {
		fld.push(key);
	}

	twic.db.readTransaction( function(tr) {
		tr.executeSql('select ' + fld.join(',') + ' from ' + obj.table + ' where ' + fieldname + ' = ? limit 1', [
			value
		], function(tr, res) {
			if (res.rows.length == 1) {
				for (var key in this.fields) {
					obj[key] = res.rows.item(0)[key];
				}
				
				obj.exists = true;
				callback.apply(obj);
			} else {
				nfcallback.apply(obj);
			}
		} );
	} );
};

twic.dbobject.prototype.loadById = function(id, callback, nfcallback) {
	return this.loadByFieldValue('id', id, callback, nfcallback);
};
