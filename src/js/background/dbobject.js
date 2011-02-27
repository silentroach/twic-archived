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

	/**
	 * Record changed
	 * @type {boolean}
	 */
	this.changed = false;
};

/**
 * Handler for field value changed
 * @param {string} fieldName Field name
 * @param {string|number} newValue New field value
 */
twic.DBObject.prototype.onFieldChanged = function(fieldName, newValue) {

};

/**
 * Load object from JSON
 * @param {Object} obj JSON object
 */
twic.DBObject.prototype.loadFromJSON = function(obj) {
	var dbobject = this;

	for (var key in dbobject.fields) {
		var fld = key;

		if (key in dbobject.jsonMap) {
			if (typeof dbobject.jsonMap[key] == 'string') {
				fld = dbobject.jsonMap[key];
			} else {
				dbobject.setValue(key, dbobject.jsonMap[key](obj));
				continue;
			}
		};

		if (fld in obj) {
			dbobject.setValue(key, obj[fld]);
		};
	};
};

/**
 * Update object from json
 * @param {number} id Object identifier
 * @param {Object} obj Object
 */
twic.DBObject.prototype.updateFromJSON = function(id, obj) {
	var dbobject = this;

	var updateMe = function() {
		this.loadFromJSON(obj);
		this.save();
	};

	dbobject.loadById(id, updateMe, updateMe);
};

/**
 * Save object to database
 * TODO update only fields with changed values
 * @param {function()} callback Callback function
 */
twic.DBObject.prototype.save = function(callback) {
	var
		dbobject = this;

	if (
		dbobject.exists
		&& !dbobject.changed
	) {
		// nothing was changed
		return;
	}

	var
		fld = [],
		params = [],
		vals = [],
		sql = '';

	for (var key in dbobject.fields) {
		if (key == 'id') {
			continue;
		}

		fld.push(key);
		params.push('?');
		vals.push(dbobject.fields[key]);
	}

	vals.push(dbobject.fields['id']);

	sql += dbobject.exists ? 'update ' : 'insert into ';
	sql += dbobject.table + ' ';

	if (dbobject.exists) {
		var setters = [];

		for (var i = 0; i < fld.length; ++i) {
			setters.push(fld[i] + ' = ?');
		}

		sql += 'set ' + setters.join(',') + ' where id = ?';
	} else {
		sql += '(' + fld.join(',') + ',id) values (' + params.join(',') + ', ?)';
	}

	console.info(sql);

	twic.db.execute(sql, vals, callback);
};

/**
 * Set new value to object property
 * @param {string} fieldname Field name
 * @param {number|string} value New value
 */
twic.DBObject.prototype.setValue = function(fieldname, value) {
	var dbobject = this;

	if (
		fieldname in dbobject.fields
		&& dbobject.fields[fieldname] != value
	) {
		if (dbobject.exists) {
			dbobject.onFieldChange(fieldname, value);
		}

		dbobject.fields[fieldname] = value;
	}
};

/**
 * Load object from the db row
 * @param {Object} row Row
 * @param {string} alias Alias
 */
twic.DBObject.prototype.loadFromRow = function(row, alias) {
	var 
		obj = this,
		al = (alias ? alias + '_' : '');

	for (var key in obj.fields) {
		obj.setValue(key, row[al + key]);
	}
};

/**
 * Get the field list
 * @param {string} alias Alias
 */
twic.DBObject.prototype.getFieldString = function(alias) {
	var 
		obj = this,
		result = '';
	
	for(var key in obj.fields) {
		result += (alias ? alias + '.' : '') + key + (alias ? ' ' + alias + '_' + key : '') + ', ';
	}
	
	return result.slice(0, result.length - 2);
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
	
	var sql = 'select ' + fld.join(',') + ' from ' + obj.table + ' where ' + fieldname + ' = ? limit 1';

	twic.db.select(sql, [value], function() {
		if (this.length == 1) {
			obj.loadFromRow(this.item(0));
			obj.exists = true;

			callback.apply(obj);
		} else {
			nfcallback.apply(obj);
		}
	}, function(error) {
		nfcallback.apply(obj);
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
