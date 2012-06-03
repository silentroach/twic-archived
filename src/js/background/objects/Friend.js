/**
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

/**
 * @constructor
 * @extends twic.DBObject
 */
twic.db.obj.Friend = function() {
    twic.DBObject.call(this);

    this.table = 'friends';
    this.fields = {
        'id': '',
        'following': '',
        'dt': twic.utils.date.getCurrentTimestamp()
    };

    var getIds = function(obj) {
        return [obj['source']['id'], obj['target']['id']].sort();
    };

    this.jsonMap = {
        'id': function(obj) {
            return getIds(obj).join('_');
        },
        'following': function(obj) {
            var
                ids = getIds(obj),
                f_nd = obj['source']['id'] === ids[0] ? obj['source'] : obj['target'];

            return [f_nd['following'] ? '1' : '0', f_nd['followed_by'] ? '1' : '0'].join('_');
        }
    };
};

goog.inherits(twic.db.obj.Friend, twic.DBObject);

/**
 * Overriden save method to update the dt field (friend info last update time)
 * @param {function()=} callback Callback function
 * @override
 */
twic.db.obj.Friend.prototype.save = function(callback) {
    this.fields['dt'] = twic.utils.date.getCurrentTimestamp();

    twic.DBObject.prototype.save.call(this);
};

/**
 * Get record by source and target ids
 * @param {number} sourceId
 * @param {number} targetId
 * @param {function()} callback Object found callback
 * @param {function()} nfcallback Object not found callback
 */
twic.db.obj.Friend.prototype.loadByIds = function(sourceId, targetId, callback, nfcallback) {
    twic.DBObject.prototype.loadById.call(
        this,
        [sourceId, targetId].sort().join('_'),
        callback,
        nfcallback
    );
};

/**
 * Get the following status of sourceId to targetId
 * @param {number} sourceId
 * @param {number} targetId
 * @return {Object}
 */
twic.db.obj.Friend.prototype.getFollowing = function(sourceId, targetId) {
    var
        fid = parseInt(this.fields['id'].split('_').shift(), 10),
        f = this.fields['following'].split('_'),
        res = {
            'following': (fid === sourceId ? f[0] : f[1]) === '1',
            'followed':  (fid === sourceId ? f[1] : f[0]) === '1'
        };

    return res;
};
