/**
 * Database objet list
 *
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

/**
 * @constructor
 * @param {!function(*)} cls DBObject constructor function name
 */
twic.DBObjectList = function(cls) {
	this.cls = cls;

	/**
	 * @type {Object.<number,twic.DBObject>}
	 */
	this.items = { };
};

/**
 * Clear the object list
 */
twic.DBObjectList.prototype.clear = function() {
	this.items = { };
};

/**
 * Load objects from result dataset
 * @param {!Object} result Dataset
 * @param {string} alias Alias
 */
twic.DBObjectList.prototype.load = function(result, alias) {
	var
		objList = this,
		i;

	for (i = 0; i < result.length; ++i) {
		/**
		 * @type {twic.DBObject}
		 */
		var obj = new objList.cls();
		obj.loadFromRow(result.item(i), alias);

		objList.items[obj.fields['id']] = obj;
	}
};

/**
 * Push the unique object to list
 * @param {Object} row DB row
 * @param {string} alias Alias for fields
 */
twic.DBObjectList.prototype.pushUnique = function(row, alias) {
	var
		objList = this,
		id = row[(alias ? alias + '_' : '') + 'id'];

	if (
		!id
		|| objList.items[id]
	) {
		return;
	}

	var obj = new objList.cls();
	obj.loadFromRow(row, alias);

	objList.items[id] = obj;
};
