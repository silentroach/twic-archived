/**
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

/**
 * @constructor
 */
twic.DBObject = function() {
	/**
	 * Table
	 * @type {string}
	 */
	this.table = '';

	/**
	 * Field list
	 * @type {Object}
	 */
	this.fields = { };

	/**
	 * Json map to override field names
	 * @type {Object}
	 */
	this.jsonMap = { };

	/**
	 * Record exists
	 * @type {boolean}
	 */
	this.exists = false;
}

/**
 * Load object from JSON
 * @param {Object} obj JSON object
 */
twic.DBObject.prototype.loadFromJSON = function(obj) {
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

/**
 * Save object to database
 * @param {function()} callback Callback function
 */
twic.DBObject.prototype.save = function(callback) {
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
		sql += '(' + fld.join(',') + ',id) values (' + params.join(',') + ', ?)';
	}
	
	console.info(sql);
	
	twic.db.transaction( function(tr) {
		tr.executeSql(sql, vals, null, function(tr, error) {
			console.error(sql, vals);
			console.dir(error);
		} );
		
		if (callback) {
			callback();
		}
	} );
};

/**
 * Set new value to object property
 * @param {string} fieldname Field name
 * @param {number|string} value New value
 */
twic.DBObject.prototype.setValue = function(fieldname, value) {
	if (fieldname in this.fields) {
		this.fields[fieldname] = value;
	}
};

/**
 * Locate and load object by field value
 * @param {string} fieldname Field name
 * @param {number|string} value Value
 * @param {function()} callback Object found callback
 * @param {function()} nfcallback Object not found callback
 */
twic.DBObject.prototype.loadByFieldValue = function(fieldname, value, callback, nfcallback) {
	var 
		obj = this,
		fld = [];
	
	for (var key in obj.fields) {
		fld.push(key);
	}

	twic.db.readTransaction( function(tr) {
		var sql = 'select ' + fld.join(',') + ' from ' + obj.table + ' where ' + fieldname + ' = ? limit 1';
	
		console.info(sql, value);
	
		tr.executeSql(sql, [
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

/**
 * Locate and load object by id
 * @param {number} id Identifier
 * @param {function()} callback Object found callback
 * @param {function()} nfcallback Object not found callback
 */
twic.DBObject.prototype.loadById = function(id, callback, nfcallback) {
	return this.loadByFieldValue('id', id, callback, nfcallback);
};
