/**
 * Timelines
 *
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

var prepareTweetInfo = function(tweet, user, users, isSeparator) {
    var
        retweeted = tweet.fields['retweeted_user_id'] ? users.items[tweet.fields['retweeted_user_id']] : null,
        tweetInfo = {
            'msg': tweet.fields['msg'],
            'user': user.getPart(['id', 'screen_name', 'avatar', 'is_protected']),
            'retweeted': retweeted ? retweeted.getPart(['id', 'screen_name', 'avatar', 'is_protected']) : null,
            'separator': isSeparator,
            'dt': tweet.fields['dt'],
            'links': { 'length': 0 },
            'media': { 'length': 0 }
        };

    if (null !== tweet.fields['reply_to']) {
        tweetInfo['reply_to'] = tweet.fields['reply_to'];
    }

    if (twic.options.getValue('tweet_show_client')) {
        tweetInfo['source'] = tweet.fields['source'];
    }

    if (tweet.fields['geo']
        && 1 == user.fields['geo_enabled']
        && twic.options.getValue('tweet_show_geo')
    ) {
        tweetInfo['geo'] = tweet.fields['geo'].split(',');
    }

    return tweetInfo;
};

var fetchData = function(ids, reply, callback) {
    var
        showImages = twic.options.getValue('tweet_show_images');

    async.forEachSeries( [
        function(callback) {
            twic.db.openQuery('select * from links where tweet_id in (' + ids.join(',') + ')', [], function(rows) {
                var i;

                for (i = 0; i < rows.length; ++i) {
                    var
                        row = rows.item(i);

                    reply[row['tweet_id']]['links'][row['lnk']] = row['expanded'];
                    ++reply[row['tweet_id']]['links']['length'];
                }

                callback();
            }, callback );
        },
        function(callback) {
            twic.db.openQuery('select * from media where tweet_id in (' + ids.join(',') + ')', [], function(rows) {
                var i;

                for (i = 0; i < rows.length; ++i) {
                    var
                        row = rows.item(i),
                        link = false;

                    if (showImages) {
                        reply[row['tweet_id']]['media'][reply[row['tweet_id']]['media']['length']++] = [
                            row['preview'],
                            row['expanded']
                        ];
                    }

                    link = row['expanded'];

                    reply[row['tweet_id']]['links'][row['lnk']] = link;
                    ++reply[row['tweet_id']]['links']['length'];
                }

                callback();
            }, callback );
        }
    ], function(func, callback) {
        func(callback);
    }, callback );
};

// listen for the "getTimeline" request
twic.requests.subscribe('getTimeline', function(data, sendResponse) {
    var
        id = data['id'],
        options = { },
        account = twic.accounts.getInfo(id);

    if ('after' in data) {
        options['afterId'] = data['after'];
    } else
    if ('before' in data) {
        options['beforeId'] = data['before'];
    }

    if (account) {
        var
            unreadCount = account.fields['unread_tweets_count'];

        // we need to get the homeTimeline if user is in out accounts
        twic.twitter.getHomeTimeline(id, function(tweets, users) {
            // prepare tweets data and send the response
            var
                reply = { },
                ids = [],
                tweetId = '';

            for (tweetId in tweets.items) {
                var
                    tweet     = tweets.items[tweetId],
                    user      = users.items[tweet.fields['user_id']],
                    tweetInfo = prepareTweetInfo(tweet, user, users, 0 === --unreadCount);

                ids.push('"' + tweetId + '"');
                reply[tweet.fields['id']] = tweetInfo;
            }

            fetchData(ids, reply, function() {
                sendResponse( {
                    'account': {
                        'id': account.fields['id'],
                        'name': account.user.fields['screen_name']
                    },
                    'data': reply
                } );
            } );
        }, options);

        account.setValue('unread_tweets_count', 0);
        account.save();
    }
} );

twic.requests.subscribe('sendTweet', function(data, sendResponse) {
    twic.twitter.updateStatus(data['id'], data['tweet'], data['coords'], function() {
        sendResponse({ });
    } );
} );

twic.requests.subscribe('replyTweet', function(data, sendResponse) {
    twic.twitter.replyStatus(data['id'], data['tweet'], data['coords'], data['replyTo'], function() {
        sendResponse({ });
    } );
} );

twic.requests.subscribe('retweet', function(data, sendResponse) {
    twic.twitter.retweet(data['userId'], data['tweetId'], function() {
        sendResponse({ });
    } );
} );

twic.requests.subscribe('delete', function(data, sendResponse) {
    twic.twitter.deleteTweet(data['userId'], data['tweetId'], function() {
        sendResponse({ });
    } );
} );
