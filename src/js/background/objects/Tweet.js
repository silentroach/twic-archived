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
            var
                coords;

            var checkCoordinates = function(obj) {
                if ('geo' in obj &&
                    obj['geo'] &&
                    'Point' === obj['geo']['type'] &&
                    'coordinates' in obj['geo']
                ) {
                    return obj['geo']['coordinates'].join(',');
                }

                return null;
            };

            if ('retweeted_status' in obj) {
                coords = checkCoordinates(obj['retweeted_status']);
            }

            if (!coords) {
                coords = checkCoordinates(obj);
            }

            return coords;
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
    async.forEach( [
        'delete from timeline where tweet_id = ?',
        'delete from links where tweet_id = ?',
        'delete from media where tweet_id = ?'
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

    var saveLinks = function(links, callback) {
        async.forEachSeries(links, function(link, callback) {
            twic.db.execQuery(
                'insert into links (tweet_id, lnk, expanded) ' +
                'values (?, ?, ?) ', [
                self.fields['id'],
                link[0],
                link[1]
            // FIXME make it optional callbacks
            ], callback, callback);
        }, callback );
    };

    var saveMedia = function(media, callback) {
        async.forEachSeries(media, function(mediaItem, callback) {
            twic.db.execQuery(
                'insert into media (tweet_id, lnk, preview, expanded) ' +
                'values (?, ?, ?, ?) ', [
                self.fields['id'],
                mediaItem[0],
                mediaItem[1][0],
                mediaItem[1][1]
            // FIXME make it optional callbacks
            ], callback, callback);
        }, callback );
    };

    var processEntities = function() {
        var
            objects = [self.jsonObj],
            links = { },
            media = { };

        if ('retweeted_status' in self.jsonObj) {
            objects.push(self.jsonObj['retweeted_status']);
        }

        async.forEach(objects, function(object, callback) {
            if ('entities' in object) {
                var
                    entities = object['entities'],
                    tmpText = self.fields['msg'],
                    idx;

                if ('media' in entities) {
                    var
                        mediaItems = entities['media'],
                        mediaItem;

                    for (idx in mediaItems) {
                        mediaItem = mediaItems[idx];

                        if ('url' in mediaItem
                            && 'expanded_url' in mediaItem
                            && !goog.isNull(mediaItem['expanded_url'])
                        ) {
                            var
                                previewLink = 'media_url_https' in mediaItem
                                    ? mediaItem['media_url_https'] : mediaItem['media_url'];

                            media[ mediaItem['url'] ] = [
                                previewLink, mediaItem['expanded_url']
                            ];
                        }
                    }
                }

                if ('urls' in entities) {
                    var
                        urlItems = entities['urls'],
                        urlItem;

                    for (idx in urlItems) {
                        urlItem = urlItems[idx];

                        if (
                            'url' in urlItem
                            && 'expanded_url' in urlItem
                            && !goog.isNull(urlItem['expanded_url'])
                        ) {
                            var
                                expandedUrl = urlItem['expanded_url'];

                            if (
                                ['jpg', 'png', 'gif', 'bmp'].indexOf(expandedUrl.split('.').pop()) >= 0
                            ) {
                                media[ urlItem['url'] ] = [
                                    expandedUrl, expandedUrl
                                ];
                            } else {
                                var
                                    urlInfo = twic.text.getUrlParts(expandedUrl);

                                links[ urlItem['url'] ] = expandedUrl;

                                if (urlInfo) {
                                    var
                                        thumb = twic.services.getThumbnail(urlInfo.domain, urlInfo.query);

                                    if (thumb) {
                                        media[ urlItem['url'] ] = [
                                            thumb, expandedUrl
                                        ];
                                    }
                                }
                            }
                        }
                    }
                }
            }

            callback();
        }, function() {
            // lets save links and media
            var
                linksArray = [],
                mediaArray = [],
                linkItem,
                mediaItem;

            for (linkItem in links) {
                linksArray.push( [ linkItem, links[linkItem] ]);
            }

            for (mediaItem in media) {
                mediaArray.push( [ mediaItem, media[mediaItem] ]);
            }

            saveLinks(linksArray, function() {
                saveMedia(mediaArray, function() {
                    onDone();
                } );
            } );
        } );
    };

    twic.DBObject.prototype.save.call(self, function(changed) {
        if (null === changed) {
            onDone();
            return;
        }

        if (!changed) {
            // for insert
            processEntities();
        } else {
            // for update
            twic.db.execQueries( [
                { sql: 'delete from links where tweet_id = ?', params: [self.fields['id']] },
                { sql: 'delete from media where tweet_id = ?', params: [self.fields['id']] }
            ], function() {
                processEntities();
            }, callback);
        }
    } );
};

