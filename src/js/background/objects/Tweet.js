/**
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

/**
 * @constructor
 * @extends twic.DBObject
 */
twic.db.obj.Tweet = function() {
	twic.DBObject.call(this);

	/**
	 * Json object
	 * @protected
	 * @type {Object}
	 */
	this.jsonObj = { };

	this.table = 'tweets';
	this.fields = {
		'id': '',
		'user_id': 0,
		'reply_to': null,
		'dt': twic.utils.date.getCurrentTimestamp(),
		'retweeted_user_id': null,
		'msg': '',
		'source': '',
		'geo': null
	};

	this.jsonMap = {
		'id': 'id_str',
		'reply_to': 'in_reply_to_status_id_str',

		'msg': function(obj) {
			return obj['retweeted_status'] ? obj['retweeted_status']['text'] : obj['text'];
		},
		'dt': function(obj) {
			return twic.utils.date.getTimestamp(new Date(obj['created_at']));
		},
		'user_id': function(obj) {
			return obj['user']['id'];
		},
		'retweeted_user_id': function(obj) {
			if (obj['retweeted_status']) {
				var
					rts = obj['retweeted_status'];

				if (rts['user']) {
					return rts['user']['id'];
				}

				return rts['in_reply_to_user_id'];
			}

			return null;
		},
		'geo': function(obj) {
			if (obj['geo']
				&& 'Point' === obj['geo']['type']
				&& 'coordinates' in obj['geo']
			) {
				return obj['geo']['coordinates'].join(',');
			}

			return null;
		}
	};
};

goog.inherits(twic.db.obj.Tweet, twic.DBObject);

/**
 * Overriden remove method to remove timeline items too
 * @param {function()} callback Callback function
 * @override
 */
twic.db.obj.Tweet.prototype.remove = function(callback) {
	var
		self = this;

	// lets remove some tweet crap
	twic.utils.queueIterator( [
		'delete from timeline where tweet_id = ?',
		'delete from links where tweet_id = ?'
	], function(sqlText, callback) {
		twic.db.execQuery(sqlText, [self.fields['id']], callback, callback);
	}, function() {
		twic.DBObject.prototype.remove.call(self, callback);
	} );
};

/**
 * Load object from JSON
 * @param {Object} obj JSON object
 * @return {twic.DBObject}
 */
twic.db.obj.Tweet.prototype.loadFromJSON = function(obj) {
	this.jsonObj = obj;

	return twic.DBObject.prototype.loadFromJSON.call(this, obj);
};

/**
 * Save object to database
 * @param {function()=} callback Callback function
 */
twic.db.obj.Tweet.prototype.save = function(callback) {
	var
		self = this;

	var onDone = function() {
		if (callback) {
			callback();
		}
	};

	twic.DBObject.prototype.save.call(self, function() {
		twic.db.execQuery('delete from links where tweet_id = ?', [self.fields['id']], function() {
			if (
				'entities' in self.jsonObj
				&& 'urls' in self.jsonObj['entities']
				&& self.jsonObj['entities']['urls'].length > 0
			) {
				var
					urls = self.jsonObj['entities']['urls'],
					i;

				twic.utils.queueIterator(urls, function(url, callback) {
					if (
						'url' in url
						&& 'expanded_url' in url
						&& !goog.isNull(url['expanded_url'])
					) {
						twic.db.execQuery('insert into links (tweet_id, lnk, expanded) values (?, ?, ?)', [
							self.fields['id'],
							url['url'],
							url['expanded_url']
						// FIXME make it optional callbacks
						], onDone, onDone);
					}
				}, onDone )
			} else {
				onDone();
			}
		}, callback);
	} );
};

