/**
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

/**
 * @constructor
 */
twic.DBObjectList = function(cls) {
	this.cls = cls;
	this.items = { };
}

/**
 * Load objects from result dataset
 * @param {Object} result Dataset
 */
twic.DBObjectList.prototype.load = function(result) {
	var objList = this;

	for (var i = 0; i < result.rows.length; ++i) {
		/**
		 * @type {twic.DBObject} obj
		 */
		var obj = new objList.cls();
		obj.loadFromRow(result.rows.item(i));

		obj.items[obj.fields['id']] = obj;
	}
}

/**
 * Push the unique object to list
 * @param {Object} row DB row
 * @param {string} alias Alias for fields
 */
twic.DBObjectList.prototype.pushUnique = function(row, alias) {
	var 
		objList = this,
		id = row[(alias ? alias + '_' : '') + 'id'];
	
	if (id in objList.items) {
		return;
	}
	
	var obj = new objList.cls();
	obj.loadFromRow(row, alias);
	
	objList.items[id] = obj;
}
