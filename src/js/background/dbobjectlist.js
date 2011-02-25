/**
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

twic.DBObjectList = function(cls) {
	this.cls = cls;
	this.length = 0;
}

/**
 * Load objects from result dataset
 * @param {Object} result Dataset
 */
twic.DBObjectList.load = function(result) {
	var objList = this;

	for (var i = 0; i < result.rows.length; ++i) {
		/**
		 * @type {twic.DBObject} obj
		 */
		var obj = new objList.cls();
		obj.loadFromRow(result.rows.item(i));

		objList[objList.length++] = obj;
	}
}
