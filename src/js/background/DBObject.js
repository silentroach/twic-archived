/**
 * Database object
 *
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
	 * Fields that was changed
	 * @type {Array}
	 */
	this.changed = [];
};

/**
 * Handler for field value changed
 * @param {string} fieldName Field name
 * @param {string|number} newValue New field value
 */
twic.DBObject.prototype.onFieldChanged = function(fieldName, newValue) { };

/**
 * Load object from JSON
 * @param {Object} obj JSON object
 * @return {twic.DBObject}
 */
twic.DBObject.prototype.loadFromJSON = function(obj) {
	var
		dbobject = this,
		key;

	dbobject.changed = [];

	for (key in dbobject.fields) {
		var
			fld = key,
			mapped = dbobject.jsonMap[key];

		if (goog.isFunction(mapped)) {
			dbobject.setValue(key, mapped(obj));
		} else {
			if (goog.isString(mapped)) {
				fld = mapped;
			}

			if (obj[fld]) {
				dbobject.setValue(key, obj[fld]);
			}
		}
	}

	return dbobject;
};

/**
 * Update object from json
 * @param {number|string} id Object identifier
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
 * Save object to database, simple SQL generator for insert and update statements
 * @param {function()=} callback Callback function
 */
twic.DBObject.prototype.save = function(callback) {
	var
		dbobject = this,
		hasId = dbobject.fields['id'];

	if (
		dbobject.exists
		&& 0 === dbobject.changed.length
	) {
		// nothing was changed
		return;
	}

	var
		fld = [],
		params = [],
		vals = [],
		sql = '',
		key;

	for (key in dbobject.fields) {
		if (
			key !== 'id'
			&& (
				!dbobject.exists
				|| dbobject.changed.indexOf(key) >= 0
			)
		) {
			fld.push(key);
			params.push('?');
			vals.push(dbobject.fields[key]);
		}
	}

	if (hasId) {
		vals.push(dbobject.fields['id']);
	}

	sql += dbobject.exists ? 'update ' : 'insert into ';
	sql += dbobject.table + ' ';

	if (dbobject.exists) {
		var
			setters = [],
			i;

		for (i = 0; i < fld.length; ++i) {
			setters.push(fld[i] + ' = ?');
		}

		sql += 'set ' + setters.join(', ') + ' where id = ?';
	} else {
		sql += '(' + fld.join(', ') +
			(hasId ? ', id' : '') + ') values (' +
			params.join(', ') +
			(hasId ? ', ?' : '') + ')';
	}

	twic.db.execQuery(sql, vals, function() {
		// reset flags
		dbobject.exists = true;
		dbobject.changed = [];

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
	var dbobject = this;

	if (
		dbobject.fields[fieldname] !== value
	) {
		// change the value
		dbobject.fields[fieldname] = value;

		// change handler
		if (dbobject.exists) {
			// changed fields
			if (dbobject.changed.indexOf(fieldname) < 0) {
				dbobject.changed.push(fieldname);
			}

			dbobject.onFieldChanged(fieldname, value);
		}
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
		al = (alias ? alias + '_' : ''),
		fkey;

	for (fkey in obj.fields) {
		obj.setValue(fkey, row[al + fkey]);
	}

	obj.exists = true;
	obj.changed = [];
};

/**
 * Get the field list
 * @param {string} alias Alias
 */
twic.DBObject.prototype.getFieldString = function(alias) {
	var
		obj = this,
		result = '',
		key;

	for(key in obj.fields) {
		result += (alias ? alias + '.' : '') + key + (alias ? ' ' + alias + '_' + key : '') + ', ';
	}

	return result.slice(0, result.length - 2);
};

/**
 * Get the new object with fields
 * @param {Array.<string>} fields Field listen
 * @return {Object} New object
 */
twic.DBObject.prototype.getPart = function(fields) {
	var
		obj = this,
		newObj = { },
		key;

	fields.forEach( function(key) {
		newObj[key] = obj.fields[key];
	} );

	return newObj;
};

/**
 * Remove the item
 * @param {function()} callback Callback function
 */
twic.DBObject.prototype.remove = function(callback) {
	var
		self = this;

	twic.db.execQuery('delete from ' + self.table + ' where id = ?', [
		self.fields['id']
	], callback);
};

/**
 * Locate and load object by field value, simple SQL select statement generator and executor
 * @param {string|Array.<string>} fieldname Field name
 * @param {number|string|Array.<number|string>} value Value
 * @param {function()} callback Object found callback
 * @param {function()} nfcallback Object not found callback
 */
twic.DBObject.prototype.loadByFieldValue = function(fieldname, value, callback, nfcallback) {
	var
		obj = this,
		fld = [],
		whereClause = [],
		values = goog.isObject(value) ? value : [value],
		/** @type {string} **/ sql,
		/** @type {number} **/ i,
		/** @type {string} **/ key;

	if (goog.isString(fieldname)) {
		whereClause = [fieldname + ' = ?'];
	} else {
		for (i = 0; i < fieldname.length; ++i) {
			whereClause.push(fieldname[i] + ' = ?');
		}
	}

	for (key in obj.fields) {
		fld.push(key);
	}

	sql = 'select ' + fld.join(',') + ' from ' + obj.table + ' where ' + whereClause.join(' and ') + ' limit 1';

	twic.db.openQuery(sql, values, function(rows) {
		if (rows.length === 1) {
			obj.loadFromRow(rows.item(0));

			callback.apply(obj);
		} else {
			obj.exists = false;
			nfcallback.apply(obj);
		}
	}, function(error) {
		nfcallback.apply(obj);
	} );
};

/**
 * Locate and load object by id
 * @param {number|string} id Identifier
 * @param {function()} callback Object found callback
 * @param {function()} nfcallback Object not found callback
 */
twic.DBObject.prototype.loadById = function(id, callback, nfcallback) {
	return this.loadByFieldValue('id', id, callback, nfcallback);
};
