/**
 * Accounts list
 *
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

// TODO store unread tweets counter just local

twic.accounts = { };

/**
 * @private
 */
twic.accounts.items_ = [];

/**
 * Schedule to update user home timeline
 * @private
 */
twic.accounts.scheduler_ = function() {
    var i = 0;

    for (i in twic.accounts.items_) {
        twic.twitter.updateHomeTimeline(twic.accounts.items_[i].fields['id']);
        twic.twitter.updateMentions(twic.accounts.items_[i].fields['id']);
    }
};

// ----------------------------------------

/**
 * Clear the accounts array
 * @private
 */
twic.accounts.clear_ = function() {
    twic.accounts.items_ = { };
};

/**
 * Update the unread messages counter
 * @private
 */
twic.accounts.updateCounter_ = function() {
    var
        unreadTweetsCount = 0,
        unreadMentionsCount = 0,
        unreadCount = 0,
        badgeHint = [],
        badgeColor = '#4e5764',
        id = 0;

    for (id in twic.accounts.items_) {
        unreadTweetsCount += twic.accounts.items_[id].fields['unread_tweets_count'];
        unreadMentionsCount += twic.accounts.items_[id].fields['unread_mentions_count'];
    }

    if (unreadMentionsCount > 0) {
        badgeColor = '#1155cc';
    }

/*
    if (unreadDMCount > 0) {
        badgeColor = '#dd2228';
    }
*/

    unreadCount = unreadTweetsCount + unreadMentionsCount;

    if (unreadCount > 0) {
        badgeHint.push(
            twic.i18n.translate(
                'badge_unread_tweets_count',
                [unreadCount]
            )
        );
    }

    chrome.browserAction.setTitle( {
        'title': badgeHint.length > 0 ? badgeHint.join("\n") : twic.name
    } );

    chrome.browserAction.setBadgeText( {
        'text': unreadCount === 0
            ? ''
            : (unreadCount < 100
                ? unreadCount.toString()
                : '...'
            )
    } );

    chrome.browserAction.setBadgeBackgroundColor( {
        'color': badgeColor
    } );
};

/**
 * Update accounts info
 * @private
 * @param {function()=} callback Callback function
 * todo think about more nice solution
 */
twic.accounts.updateList_ = function(callback) {
    var
        tmpAccount = new twic.db.obj.Account(),
        tmpUser    = new twic.db.obj.User();

    twic.accounts.clear_();

    twic.db.openQuery(
        'select ' + tmpAccount.getFieldString('a') + ', ' + tmpUser.getFieldString('u') + ' ' +
        'from accounts a ' +
            'inner join users u on ( ' +
                'u.id = a.id ' +
            ') ' +
        'order by u.screen_name_lower ', [],
        function(rows) {
            var
                accs = new twic.DBObjectList(twic.db.obj.Account),
                usrs = new twic.DBObjectList(twic.db.obj.User),
                id = 0;

            accs.load(rows, 'a');
            usrs.load(rows, 'u');

            for (id in accs.items) {
                var tmp = accs.items[id];
                tmp.user = usrs.items[id];

                twic.accounts.items_[id] = tmp;
                twic.accounts.items_[id].onUnreadTweetsCountChanged = twic.accounts.updateCounter_;
            }

            twic.accounts.updateCounter_();

            if (callback) {
                callback.apply(twic.accounts);
            }
    } );
};

/**
 * Get user info
 * @param {number} id User id
 * @return {Object|boolean} Account or false
 */
twic.accounts.getInfo = function(id) {
    if (twic.accounts.items_[id]) {
        return twic.accounts.items_[id];
    }

    return false;
};

/**
 * Get user info by nick
 * @private
 * @param {string} nick User nick
 * @return {Object|boolean} Account or false
 */
twic.accounts.getInfoByNick_ = function(nick) {
    var
        nickLowered = nick.toLowerCase(),
        id = 0;

    for (id in twic.accounts.items_) {
        if (twic.accounts.items_[id].user.fields['screen_name_lower'] === nickLowered) {
            return twic.accounts.items_[id];
        }
    }

    return false;
};

// ------------------------------------------

twic.accounts.updateList_( function() {
    // first check in 5 seconds
    setTimeout(function() {
        twic.accounts.scheduler_();

        // and then every minute check
        setInterval(twic.accounts.scheduler_, 60 * 1000);
    }, 5000);
} );

// -----------------------------------------

twic.requests.subscribe('accountRemove', function(data, sendResponse) {
    var
        id = data['id'] || -1,
        account;

    var fail = function() {
        sendResponse( {
            'result': twic.global.FAILED
        } );

        return;
    };

    if (id < 0) {
        fail();
    }

    account = twic.accounts.getInfo(id);

    if (!account) {
        fail();
    }

    twic.db.execQueries( [
        { sql: 'delete from timeline where user_id = ?', params: [id] },
        { sql: 'delete from accounts where id = ?', params: [id] }
    ], function() {
        twic.twitter.resetLastId(id);

        twic.accounts.updateList_( function() {
            sendResponse( {
                'result': twic.global.SUCCESS
            } );
        } );
    } );
} );

twic.requests.subscribe('accountAdd', function(data, sendResponse) {
    twic.api.accountAdd(function() {
        sendResponse( {
            'result': twic.global.SUCCESS
        } );
    }, function() {
        sendResponse( {
            'result': twic.global.FAILED
        } );
    } );
} );

twic.requests.subscribe('accountList', function(data, sendResponse) {
    var
        accs = [],
        id = 0;

    for (id in twic.accounts.items_) {
        var item = twic.accounts.items_[id];

        accs.push( {
            'id': id,
            'avatar': item.user.fields['avatar'],
            'screen_name': item.user.fields['screen_name'],
            'unread_tweets': item.fields['unread_tweets_count'],
            'unread_mentions': item.fields['unread_mentions_count']
        } );
    }

    sendResponse(accs);
} );

twic.requests.subscribe('accountAuth', function(data, sendResponse) {
    if (!data['pin']
        || !data['user_nick']
    ) {
        sendResponse( {
            'res': twic.global.FAILED
        } );

        return;
    }

    var
        userNick = data['user_nick'],
        account = twic.accounts.getInfoByNick_(userNick);

    if (account) {
        sendResponse( {
            'res': twic.global.AUTH_ALREADY
        } );

        return;
    }

    twic.api.getAccessToken(data['pin'], function(data) {
        var
            account = new twic.db.obj.Account();

        var afterAll = function() {
            // reset the token after auth is complete
            twic.api.resetToken();

            // update the accounts information
            twic.accounts.updateList_( function() {
                // and update the home timeline for user
                twic.twitter.updateHomeTimeline(account.fields['id']);
            } );
        };

        var checkUser = function(id) {
            var user = new twic.db.obj.User();
            user.loadById(id, afterAll, function() {
                // not found. lets get it
                twic.api.getUserInfo(id, function(info) {
                    user.loadFromJSON(info);
                    user.save(afterAll);
                } );
            } );
        };

        var updateAccount = function(account) {
            ['oauth_token', 'oauth_token_secret'].forEach( function(fieldName) {
                account.setValue(fieldName, data[fieldName]);
            } );
            account.save();

            sendResponse( {
                'res': twic.global.SUCCESS
            } );

            checkUser(account.fields['id']);
        };

        twic.twitter.getUserInfo(userNick, function(obj) {
            account.setValue('id', obj.fields['id']);
            updateAccount(account);
        } );
    }, function(error) {
        sendResponse( {
            'res': twic.global.FAILED
        } );
    } );
} );

