/**
 * Something between application and "raw" api
 *
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

twic.twitter = { };

/**
 * User identifier => last home timeline tweet identifier
 * @type {Object.<number,string>}
 * @private
 */
twic.twitter.cachedLastId_ = { };

/**
 * User identifier => last mention tweet identifier
 * @type {Object.<number,string>}
 * @private
 */
twic.twitter.cachedLastMentionId_ = { };

/**
 * Reset the last tweet id
 * @param {number} userId User ID
 */
twic.twitter.resetLastId = function(userId) {
    if (userId in twic.twitter.cachedLastId_) {
        delete twic.twitter.cachedLastId_[userId];
    }
};

/**
 * Check the config
 */
twic.twitter.checkConfig = function() {
    twic.api.getConfiruration( function(obj) {
        var
            i = '';

        for (i in obj) {
            if ('short_url_length' === i
                || 'short_url_length_https' === i
            ) {
                twic.options.setValue(i, obj[i]);
            }
        }
    } );
};

/**
 * Get the user info
 * @param {string} nick Nickname
 * @param {function(Object=)} callback Callback function
 * @param {function()=} notFoundCallback Not found callback
 */
twic.twitter.getUserInfo = function(nick, callback, notFoundCallback) {
    var
        tmpUser  = new twic.db.obj.User(),
        tmpTweet = new twic.db.obj.Tweet();

    tmpUser.loadByFieldValue(
        'screen_name_lower', nick.toLowerCase(),
        function() {
            callback(tmpUser);
        },
        function() {
            twic.api.getUserInfo(nick, function(obj) {
                tmpUser
                    .loadFromJSON(obj)
                    .save();

                if ('status' in obj) {
                    var
                        statusObj = obj['status'];

                    tmpTweet.loadById(statusObj['id_str'],
                        function() { },
                        function() {
                            // adding missed fields to load it in tweet
                            statusObj['user'] = {
                                'id': obj['id']
                            };

                            tmpTweet
                                .loadFromJSON(statusObj)
                                .save();
                        }
                    );
                }

                callback(tmpUser);
            }, function(error) {
                if (notFoundCallback
                    && twic.ResponseError.NOT_FOUND === error.code
                ) {
                    notFoundCallback();
                }
            } );
        }
    );
};

/**
 * Get friendship info
 * @param {number} source_id Source user identifier
 * @param {number} target_id Target user identifier
 * @param {function(Object)} callback Callback function
 */
twic.twitter.getFriendshipInfo = function(source_id, target_id, callback) {
    var
        tmpFriend = new twic.db.obj.Friend();

    var getInfo = function() {
        twic.api.getFriendshipInfo(
            source_id, target_id,
            function(obj) {
                tmpFriend = new twic.db.obj.Friend();

                tmpFriend
                    .loadFromJSON(obj)
                    .save();

                callback(tmpFriend);
            }
        );
    };

    tmpFriend.loadByIds(
        source_id, target_id,
        function() {
            // cache for hour
            if (tmpFriend.fields['dt'] < twic.utils.date.getCurrentTimestamp() - 60 * 60) {
                tmpFriend.remove( getInfo );
            } else {
                callback(tmpFriend);
            }
        }, getInfo
    );
};

/**
 * TODO think about refactoring
 * Get user timeline
 * @param {number} id User identifier
 * @param {Object} options Options
 * @param {function(twic.DBObjectList,twic.DBObjectList)} callback Callback function
 */
twic.twitter.getMentions = function(id, options, callback) {
    var
        tmpTweet = new twic.db.obj.Tweet(),
        tmpUser  = new twic.db.obj.User(),
        tmpLimit = 20,
        tmpWhere  = '',
        tmpParams = [id];

    if ('afterId' in options) {
        tmpWhere = ' and t.id > ? and t.dt > ? ';
        tmpParams = [id, options['afterId']['id'], options['afterId']['ts']];
        tmpLimit = 5;
    } else
    if ('beforeId' in options) {
        tmpWhere = ' and t.id < ? and t.dt < ? ';
        tmpParams = [id, options['beforeId']['id'], options['beforeId']['ts']];
        tmpLimit = 5;
    }

    // fixme holy shit
    twic.db.openQuery(
        'select ' + [
            tmpTweet.getFieldString('t'),
            tmpUser.getFieldString('u'),
            tmpUser.getFieldString('r')
        ].join(', ') + ' ' +
        'from tweets t ' +
            'inner join mentions m on (t.id = m.tweet_id) ' +
            'inner join users u on (t.user_id = u.id) ' +
            'left join users r on (t.retweeted_user_id = r.id) ' +
        'where m.user_id = ? ' + tmpWhere +
        'order by t.dt desc, t.id desc limit ' + tmpLimit,
        tmpParams,
        function(rows) {
            var
                tweetList = new twic.DBObjectList(twic.db.obj.Tweet),
                userList  = new twic.DBObjectList(twic.db.obj.User),
                i;

            for (i = 0; i < rows.length; ++i) {
                var row = rows.item(i);

                tweetList.pushUnique(row, 't');
                userList.pushUnique(row, 'u');
                userList.pushUnique(row, 'r');
            }

            callback(tweetList, userList);
        }
    );
};

/**
 * TODO think about refactoring
 * Get user timeline
 * @param {number} id User identifier
 * @param {Object} options Options
 * @param {function(twic.DBObjectList,twic.DBObjectList)} callback Callback function
 */
twic.twitter.getHomeTimeline = function(id, options, callback) {
    var
        tmpTweet = new twic.db.obj.Tweet(),
        tmpUser  = new twic.db.obj.User(),
        tmpLimit = 20,
        tmpWhere  = '',
        tmpParams = [id];

    if ('afterId' in options) {
        tmpWhere = ' and t.id > ? and t.dt > ? ';
        tmpParams = [id, options['afterId']['id'], options['afterId']['ts']];
        tmpLimit = 5;
    } else
    if ('beforeId' in options) {
        tmpWhere = ' and t.id < ? and t.dt < ? ';
        tmpParams = [id, options['beforeId']['id'], options['beforeId']['ts']];
        tmpLimit = 5;
    }

    // fixme holy shit
    twic.db.openQuery(
        'select ' + [
            tmpTweet.getFieldString('t'),
            tmpUser.getFieldString('u'),
            tmpUser.getFieldString('r')
        ].join(', ') + ' ' +
        'from tweets t ' +
            'inner join timeline tl on (t.id = tl.tweet_id) ' +
            'inner join users u on (t.user_id = u.id) ' +
            'left join users r on (t.retweeted_user_id = r.id) ' +
        'where tl.user_id = ? ' + tmpWhere +
        'order by t.dt desc, t.id desc limit ' + tmpLimit,
        tmpParams,
        function(rows) {
            var
                tweetList = new twic.DBObjectList(twic.db.obj.Tweet),
                userList  = new twic.DBObjectList(twic.db.obj.User),
                i;

            for (i = 0; i < rows.length; ++i) {
                var row = rows.item(i);

                tweetList.pushUnique(row, 't');
                userList.pushUnique(row, 'u');
                userList.pushUnique(row, 'r');
            }

            callback(tweetList, userList);
        }
    );
};

/**
 * Cleanup the friends cache links
 * @param {number} id First user
 * @param {number} id2 Second user
 * @param {function()} callback Callback function
 * @private
 */
twic.twitter.cleanupFriends_ = function(id, id2, callback) {
    var
        frnd = new twic.db.obj.Friend();

    frnd.loadByIds(id, id2, function() {
        frnd.remove(callback);
    }, callback );
};

/**
 * Follow user
 * @param {number} id User identifier
 * @param {number} whom_id Whom to follow
 * @param {function()} callback Callback function
 */
twic.twitter.follow = function(id, whom_id, callback) {
    var account = twic.accounts.getInfo(id);

    if (!account) {
        callback();
        return;
    }

    twic.api.follow(
        whom_id,
        account.fields['oauth_token'], account.fields['oauth_token_secret'],
        function() {
            twic.twitter.cleanupFriends_(id, whom_id, callback);
        }
    );
};

/**
 * Unfollow user
 * @param {number} id User identifier
 * @param {number} whom_id Whom to unfollow
 * @param {function()} callback Callback function
 */
twic.twitter.unfollow = function(id, whom_id, callback) {
    var account = twic.accounts.getInfo(id);

    if (!account) {
        callback();
        return;
    }

    twic.api.unfollow(
        whom_id,
        account.fields['oauth_token'], account.fields['oauth_token_secret'],
        function() {
            twic.twitter.cleanupFriends_(id, whom_id, callback);
        }
    );
};

/**
 * Remove user tweet
 * @param {number} userId User identifier
 * @param {string} tweetId Tweet identifier
 * @param {function()} callback Callback function
 */
twic.twitter.deleteTweet = function(userId, tweetId, callback) {
    var account = twic.accounts.getInfo(userId);

    if (!account) {
        callback();
        return;
    }

    var innerCallback = function() {
        var
            tweetObj = new twic.db.obj.Tweet();

        tweetObj.loadById(tweetId, function() {
            // delete the tweet if it is exists in database
            tweetObj.remove();
            callback();
        }, callback);
    };

    twic.api.deleteTweet(
        tweetId,
        account.fields['oauth_token'], account.fields['oauth_token_secret'],
        innerCallback, innerCallback
    );
};

/**
 * Update the user status
 * @param {number} id User identifier
 * @param {string} status New status text
 * @param {Array|boolean} coords Tweet coords
 * @param {function()} callback Callback function
 */
twic.twitter.updateStatus = function(id, status, coords, callback) {
    var account = twic.accounts.getInfo(id);

    if (!account) {
        callback();
        return;
    }

    // FIXME get all the new messages before send

    twic.api.updateStatus(
        status,
        coords,
        account.fields['oauth_token'], account.fields['oauth_token_secret'],  // fixme send just account ;)
        function(tweet) {
            var
                /** @type {string} **/ tweetId = tweet['id_str'],
                tweetObj = new twic.db.obj.Tweet();

            tweetObj.updateFromJSON(tweetId, tweet, function() {
                twic.db.obj.Timeline.pushUserTimelineTweet(id, tweetId, callback);
            } );
        }
    );
};

/**
 * Update the user status
 * @param {number} id User identifier
 * @param {string} status New status text
 * @param {Array|boolean} coords Tweet coordinates
 * @param {string} replyTo Reply to tweet identifier
 * @param {!function()} callback Callback function
 */
twic.twitter.replyStatus = function(id, status, coords, replyTo, callback) {
    var account = twic.accounts.getInfo(id);

    if (!account) {
        callback();
        return;
    }

    // FIXME get all the new messages before send

    twic.api.replyStatus(
        status,
        coords,
        replyTo,
        account.fields['oauth_token'], account.fields['oauth_token_secret'],
        function(tweet) {
            var
                /** @type {string} **/ tweetId = tweet['id_str'],
                tweetObj = new twic.db.obj.Tweet();

            tweetObj.updateFromJSON(tweetId, tweet);

            twic.db.obj.Timeline.pushUserTimelineTweet(id, tweetId, callback);
        }
    );
};

/**
 * Retweet something
 * @param {number} id User identifier
 * @param {string} tweetId Tweet identifier
 * @param {function()} callback Callback function
 */
twic.twitter.retweet = function(id, tweetId, callback) {
    var account = twic.accounts.getInfo(id);

    if (!account) {
        callback();
        return;
    }

    twic.api.retweet(
        tweetId,
        account.fields['oauth_token'], account.fields['oauth_token_secret'],
        function(tweet) {
            var
                /** @type {string} **/ tweetId = tweet['id_str'],
                tweetObj = new twic.db.obj.Tweet();

            tweetObj.updateFromJSON(tweetId, tweet);

            twic.db.obj.Timeline.pushUserTimelineTweet(id, tweetId, callback);
        }
    );
};

twic.twitter.updateMentions = function(userId) {
    var
        account = twic.accounts.getInfo(userId);

    if (!account) {
        // it is not our account. wtf?
        twic.debug.error('Can\'t find account in updateMentions', userId);
        return false;
    }

    /**
     * @param {?string} since_id
     */
    var updateSinceId = function(since_id) {
        // try to get the home timeline from api
        twic.api.getMentions(
            userId, since_id,
            account.fields['oauth_token'], account.fields['oauth_token_secret'],
            function(data) {
                var
                    users = [],
                    i,
                    tweetUserId = 0;

                if (data.length === 0) {
                    // no updates
                    return;
                }

                var incrementUnreadTweets = function() {
                    // increment the unread tweets count if it is new
                    // todo think about doing it only once per timeline update
                    account.setValue('unread_mentions_count', account.fields['unread_mentions_count'] + 1);
                    account.save();
                };

                if (data.length > 0) {
                    // updating the last tweet cache
                    twic.twitter.cachedLastMentionId_[userId] = data[0]['id_str'];
                }

                for (i = 0; i < data.length; ++i) {
                    var
                        /** @type {Object} */ tweet   = data[i],
                        /** @type {string} */ tweetId = tweet['id_str'];

                    tweetUserId = tweet['user']['id'];

                    // add the user to check it after
                    if (!users[tweetUserId]) {
                        users[tweetUserId] = tweet['user'];
                    }

                    // the same thing for retweeted_status.user if it is retweet
                    if (tweet['retweeted_status']
                        && !users[tweet['retweeted_status']['user']['id']]
                    ) {
                        users[tweet['retweeted_status']['user']['id']] = tweet['retweeted_status']['user'];
                    }

                    var tweetObj = new twic.db.obj.Tweet();
                    tweetObj.updateFromJSON(tweetId, tweet);

                    twic.db.obj.Mentions.pushUserMentionTweet(
                        userId, tweetId,
                        // only increment the unread tweets count if tweet user id isn't me
                        null //tweetUserId !== userId ? incrementUnreadTweets : undefined
                    );
                }

                // trying to save all the new users
                for (tweetUserId in users) {
                    var
                         /**
                         * @type {Object}
                         */
                        user = users[tweetUserId];

                    var userObj = new twic.db.obj.User();
                    userObj.updateFromJSON(tweetUserId, user);
                }
            }
        );
    };

    if (twic.twitter.cachedLastMentionId_[userId]) {
        updateSinceId(twic.twitter.cachedLastMentionId_[userId]);
    } else {
        // we need to find the last tweet id not to fetch the all timeline from api
        twic.db.openQuery(
            'select t.id ' +
            'from tweets t inner join mentions tl on (t.id = tl.tweet_id) ' +
            'where tl.user_id = ? order by t.dt desc, t.id desc limit 1 ', [userId],
            function(rows) {
                var
                    /** @type {string} **/ since_id = '';

                if (rows.length > 0) {
                    // nice to see you, since_id
                    since_id = rows.item(0)['id'];
                }

                updateSinceId(since_id);

                twic.twitter.cachedLastMentionId_[userId] = since_id;
            }
        );
    }
};

/**
 * Update user home timeline
 * @param {number} userId User identifier
 * todo method is too big. maybe we need to refactor it.
 * todo add callback?
 */
twic.twitter.updateHomeTimeline = function(userId) {
    var
        account = twic.accounts.getInfo(userId);

    if (!account) {
        // it is not our account. wtf?
        twic.debug.error('Can\'t find account in updateHomeTimeline', userId);
        return false;
    }

    /**
     * @param {?string} since_id
     */
    var updateSinceId = function(since_id) {
        // try to get the home timeline from api
        twic.api.getHomeTimeline(
            userId, since_id,
            account.fields['oauth_token'], account.fields['oauth_token_secret'],
            function(data) {
                var
                    users = [],
                    i,
                    tweetUserId = 0;

                if (data.length === 0) {
                    // no updates
                    return;
                }

                var incrementUnreadTweets = function() {
                    // increment the unread tweets count if it is new
                    // todo think about doing it only once per timeline update
                    account.setValue('unread_tweets_count', account.fields['unread_tweets_count'] + 1);
                    account.save();
                };

                if (data.length > 0) {
                    // updating the last tweet cache
                    twic.twitter.cachedLastId_[userId] = data[0]['id_str'];
                }

                for (i = 0; i < data.length; ++i) {
                    var
                        /** @type {Object} */ tweet   = data[i],
                        /** @type {string} */ tweetId = tweet['id_str'];

                    tweetUserId = tweet['user']['id'];

                    // add the user to check it after
                    if (!users[tweetUserId]) {
                        users[tweetUserId] = tweet['user'];
                    }

                    // the same thing for retweeted_status.user if it is retweet
                    if (
                        tweet['retweeted_status']
                        && !users[tweet['retweeted_status']['user']['id']]
                    ) {
                        users[tweet['retweeted_status']['user']['id']] = tweet['retweeted_status']['user'];
                    }

                    var tweetObj = new twic.db.obj.Tweet();
                    tweetObj.updateFromJSON(tweetId, tweet);

                    twic.db.obj.Timeline.pushUserTimelineTweet(
                        userId, tweetId,
                        // only increment the unread tweets count if tweet user id isn't me
                        tweetUserId !== userId ? incrementUnreadTweets : undefined
                    );
                }

                // trying to save all the new users
                for (tweetUserId in users) {
                    var
                         /**
                         * @type {Object}
                         */
                        user = users[tweetUserId];

                    var userObj = new twic.db.obj.User();
                    userObj.updateFromJSON(tweetUserId, user);
                }
            }
        );
    };

    if (twic.twitter.cachedLastId_[userId]) {
        updateSinceId(twic.twitter.cachedLastId_[userId]);
    } else {
        // we need to find the last tweet id not to fetch the all timeline from api
        twic.db.openQuery(
            'select t.id ' +
            'from tweets t inner join timeline tl on (t.id = tl.tweet_id) ' +
            'where tl.user_id = ? order by t.dt desc, t.id desc limit 1 ', [userId],
            function(rows) {
                var
                    /** @type {string} **/ since_id = '';

                if (rows.length > 0) {
                    // nice to see you, since_id
                    since_id = rows.item(0)['id'];
                }

                updateSinceId(since_id);

                twic.twitter.cachedLastId_[userId] = since_id;
            }
        );
    }
};

