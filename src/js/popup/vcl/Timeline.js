/**
 * Timeline visual object
 *
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

/**
 * @constructor
 */
twic.vcl.Timeline = function(parent) {

	var
		timeline = this,

		/** @type {Element} **/ buttonHolder = twic.dom.expandElement('div.holder'),
		/** @type {Element} **/ confirmer    = twic.dom.expandElement('a.confirm');

	confirmer.innerHTML = twic.utils.lang.translate('confirm_question');
	confirmer.href = '#';

	/**
	 * @type {Element}
	 */
	this.wrapper_ = twic.dom.expandElement('div.timeline');

	/**
	 * @type {boolean}
	 */
	this.buttonPressed_ = false;

	/**
	 * @type {?twic.vcl.Timeline.confirmAction}
	 * @private
	 */
	this.confirmerAction = null;

	/**
	 * @type {?number}
	 * @private
	 */
	this.clickTimer_ = null;

	/**
	 * @type {Element}
	 * @private
	 */
	this.list_ = twic.dom.expandElement('ul');

	/**
	 * @type {Element}
	 * @private
	 */
	this.hoveredTweet_ = null;

	/**
	 * @type {Element}
	 * @private
	 */
	this.tweetButtons_ = twic.dom.expandElement('div.tweetButtons');

	/**
	 * @type {Element}
	 * @private
	 */
	this.loader_ = twic.dom.expandElement('p.loader');

	/**
	 * @type {boolean}
	 * @private
	 */
	this.isLoading_ = false;

	/**
	 * @type {DocumentFragment}
	 */
	this.tweetBuffer_ = null;

	/**
	 * @type {twic.vcl.Tweet}
	 * @private
	 */
	this.replyTweet_ = null;

	/**
	 * @type {number}
	 * @private
	 */
	this.userId_ = 0;

	/**
	 * @type {string}
	 * @private
	 */
	this.userNick_ = '';

	/**
	 * @type {Object}
	 * @private
	 */
	this.firstTweetId_ = {
		'id': '',
		'ts': 0
	};

	/**
	 * @type {?string}
	 * @private
	 */
	this.lastTweetId_ = {
		'id': '',
		'ts': 0
	};

	/**
	 * @type {Object.<string, twic.vcl.Tweet>}
	 * @private
	 */
	this.tweets_ = { };

	/**
	 * @type {Element}
	 * @private
	 */
	this.tbReply_ = twic.dom.expandElement('img.tb_reply');
	this.tbReply_.title = twic.utils.lang.translate('title_reply');

	/**
	 * @type {Element}
	 * @private
	 */
	this.tbRetweet_ = twic.dom.expandElement('img.tb_retweet');
	this.tbRetweet_.title = twic.utils.lang.translate('title_retweet');

	/**
	 * @type {Element}
	 * @private
	 */
	this.tbUnRetweet_ = twic.dom.expandElement('img.tb_retweet_undo');
	this.tbUnRetweet_.title = twic.utils.lang.translate('title_retweet_undo');

	/**
	 * @type {Element}
	 * @private
	 */
	this.tbDelete_ = twic.dom.expandElement('img.tb_delete');
	this.tbDelete_.title = twic.utils.lang.translate('title_delete');

	var timelineMouseOut = function(e) {
		if (
			timeline.tweetButtons_ !== e.toElement
			&& !twic.dom.isChildOf(e.toElement, timeline.tweetButtons_)
			&& !twic.dom.isChildOf(e.toElement, timeline.list_)
		) {
			timeline.hideButtons_();
		}
	};

	var timelineMouseMove = function(e) {
		var find = e.target;

		if (!timeline.buttonPressed_) {
			while (
				find
				&& 'LI' !== find.nodeName
				&& find.parentNode
			) {
				find = find.parentNode;
			}

			if (find && find !== timeline.hoveredTweet_) {
				var
					tweet = timeline.tweets_[find.id];

				if (tweet) {
					if (tweet.isReplying()) {
						timeline.hideButtons_();
					} else {
						timeline.hoveredTweet_ = find;

						timeline.resetButtons_();

						twic.dom.setVisibility(timeline.tweetButtons_, false);

						var
							hackTop = timeline.hoveredTweet_.offsetTop - parent.scrollTop + timeline.hoveredTweet_.clientHeight + 1;

						if (hackTop > parent.clientHeight) {
							return;
						}

						var
							vReply     = twic.dom.setVisibility(timeline.tbReply_, tweet.getCanReply()),
							vRetweet   = twic.dom.setVisibility(timeline.tbRetweet_, tweet.getCanRetweet()),
							vUnRetweet = twic.dom.setVisibility(timeline.tbUnRetweet_, tweet.getCanUnRetweet()),
							vDelete    = twic.dom.setVisibility(timeline.tbDelete_, tweet.getCanDelete());

						if (vReply || vRetweet || vUnRetweet || vDelete) {
							timeline.tweetButtons_.style.display = 'block';
							timeline.tweetButtons_.style.top = (hackTop - timeline.tweetButtons_.clientHeight - 1) + 'px';
							timeline.tweetButtons_.style.right = (document.body.clientWidth - timeline.hoveredTweet_.clientWidth) + 'px';
						}
					}
				}
			}
		}
	};

	var timelineMouseDownFunc = function() {
		if (timeline.hoveredTweet_) {
			twic.dom.setVisibility(timeline.tweetButtons_, false);
			timeline.hoveredTweet_ = null;
		}

		timeline.buttonPressed_ = true;
	};

	var timelineMouseDown = function(e) {
		timeline.clickTimer_ = setTimeout(timelineMouseDownFunc, 250);
	};

	var timelineMouseUp = function(e) {
		if (timeline.clickTimer_) {
			clearTimeout(timeline.clickTimer_);
			timeline.clickTimer_ = null;

			if (
				!timeline.buttonPressed_
				&& timeline.hoveredTweet_
				&& timeline.replyTweet_
			) {
				timeline.replyTweet_.resetEditor();
				timeline.hideButtons_();
			}
		}

		timeline.buttonPressed_ = false;
	};

	// init

	this.tbReply_.addEventListener('click', function(e) {
		timeline.doReply_.call(timeline, e);
	}, false);
	buttonHolder.appendChild(this.tbReply_);

	this.tbRetweet_.addEventListener('click', function(e) {
		timeline.doRetweet_.call(timeline, e);
	}, false);
	buttonHolder.appendChild(this.tbRetweet_);

	this.tbUnRetweet_.addEventListener('click', function(e) {
		timeline.doUnRetweet_.call(timeline, e);
	}, false);
	buttonHolder.appendChild(this.tbUnRetweet_);

	this.tbDelete_.addEventListener('click', function(e) {
		timeline.doDelete_.call(timeline, e);
	}, false);
	buttonHolder.appendChild(this.tbDelete_);

	this.tweetButtons_.appendChild(buttonHolder);

	confirmer.addEventListener('click', function(e) {
		timeline.doReallyConfirm_.call(timeline, e);
	}, false);
	this.tweetButtons_.appendChild(confirmer);

	this.wrapper_.appendChild(this.list_);
	this.wrapper_.appendChild(this.tweetButtons_);
	parent.appendChild(this.wrapper_);

	this.resetButtons_();

	this.list_.addEventListener('mousedown', timelineMouseDown, false);
	this.list_.addEventListener('mouseup',   timelineMouseUp, false);
	this.list_.addEventListener('mousemove', timelineMouseMove, false);
	this.list_.addEventListener('mouseout',  timelineMouseOut, false);

	parent.addEventListener('scroll', function(e) {
		timeline.hideButtons_.call(timeline, e);
	}, false);

	// update times every minute
	setInterval( function() {
		var
			id = '';

		for (id in timeline.tweets_) {
			timeline.tweets_[id].updateTime();
		}
	}, 1000 * 60 );

};

/**
 * Confirm actions
 * @enum {number}
 */
twic.vcl.Timeline.confirmAction = {
	ACTION_RETWEET: 0,
	ACTION_UNDO_RETWEET: 1,
	ACTION_DELETE: 2
};

/**
 * Start the update
 * @param {boolean=} isBottom Show animation at the bottom of timeline?
 * @param {boolean=} noBuffer Don't use buffering
 */
twic.vcl.Timeline.prototype.beginUpdate = function(isBottom, noBuffer) {
	if (!this.isLoading_) {
		if (isBottom) {
			this.wrapper_.appendChild(this.loader_);
		} else {
			this.wrapper_.insertBefore(this.loader_, this.list_);
		}

		if (!noBuffer) {
			this.tweetBuffer_ = document.createDocumentFragment();
		}

		this.isLoading_ = true;
	}
};

/**
 * Change button image to loader animation
 * @param {Element} button Button
 * @private
 */
twic.vcl.Timeline.prototype.doButtonLoad_ = function(button) {
	// @resource img/loader.gif
	button.src = 'img/loader.gif';
};

/**
 * Retweet
 * @param {Event|boolean|null} confirmed Is it confirmed?
 * @private
 */
twic.vcl.Timeline.prototype.doRetweet_ = function(confirmed) {
	var
		timeline = this;

	if (this.hoveredTweet_) {
		if (!confirmed || !goog.isBoolean(confirmed)) {
			if (confirmed && confirmed.ctrlKey) {
				// oldstyle retweet
				var
					tweet = this.tweets_[this.hoveredTweet_.id];

				// wow, so ugly (it is Event here)
				confirmed.stopPropagation();

				this.onOldRetweet('RT @' + tweet.getAuthorNick() + ' ' + tweet.getRawText());
				this.hideAndRestoreButtons_();
				return;
			}

			this.doConfirm_(twic.vcl.Timeline.confirmAction.ACTION_RETWEET);
			return;
		}

		this.doButtonLoad_(this.tbRetweet_);

		this.onRetweet(this.userId_, this.hoveredTweet_.id, function() {
			timeline.hideAndRestoreButtons_.call(timeline);
		} );
	}
};

/**
 * Really confirm
 */
twic.vcl.Timeline.prototype.doReallyConfirm_ = function() {
	if (
		this.confirmerAction_ === twic.vcl.Timeline.confirmAction.ACTION_DELETE
		|| this.confirmerAction_ === twic.vcl.Timeline.confirmAction.ACTION_UNDO_RETWEET
	) {
		this.doDelete_(true);
	} else
	if (this.confirmerAction_ === twic.vcl.Timeline.confirmAction.ACTION_RETWEET) {
		this.doRetweet_(true);
	}

	this.resetConfirm_();
};

/**
 * Remove tweet
 * @param {Event|boolean|null} confirmed Is it confirmed?
 * @private
 */
twic.vcl.Timeline.prototype.doDelete_ = function(confirmed) {
	var
		timeline = this;

	if (this.hoveredTweet_) {
		if (!confirmed || !goog.isBoolean(confirmed)) {
			this.doConfirm_(twic.vcl.Timeline.confirmAction.ACTION_DELETE);
			return;
		}

		this.doButtonLoad_(this.tbDelete_);
		this.doButtonLoad_(this.tbUnRetweet_);

		this.onDelete(this.userId_, this.hoveredTweet_.id, function() {
			timeline.hideAndRestoreButtons_.call(timeline);
		} );
	}
};

/**
 * Remove tweet
 * @param {Event|boolean|null} confirmed Is it confirmed?
 * @private
 */
twic.vcl.Timeline.prototype.doUnRetweet_ = function(confirmed) {
	if (this.hoveredTweet_) {
		if (!confirmed || !goog.isBoolean(confirmed)) {
			this.doConfirm_(twic.vcl.Timeline.confirmAction.ACTION_UNDO_RETWEET);
			return;
		}

		this.doDelete_(true);
	}
};

/**
 * Stop the loading
 */
twic.vcl.Timeline.prototype.endUpdate = function() {
	if (this.isLoading_) {
		this.isLoading_ = false;

		if (
			this.tweetBuffer_
			&& this.tweetBuffer_.childNodes.length > 0
		) {
			this.list_.appendChild(this.tweetBuffer_);
			this.tweetBuffer_ = null;
		}

		twic.dom.removeElement(this.loader_);
	}
};

/**
 * Hide the timeline tweet buttons
 * @private
 */
twic.vcl.Timeline.prototype.hideButtons_ = function() {
	if (this.hoveredTweet_) {
		twic.dom.setVisibility(this.tweetButtons_, false);
		this.hoveredTweet_ = null;
	}
};

/**
 * Hide and restore the tweet buttons
 * @private
 */
twic.vcl.Timeline.prototype.hideAndRestoreButtons_ = function() {
	this.hideButtons_();
	this.resetButtons_();
};

/**
 * Reset the confirmer
 * @private
 */
twic.vcl.Timeline.prototype.resetConfirm_ = function() {
	this.confirmerAction_ = null;
	this.tweetButtons_.classList.remove('bconfirm');
	this.tweetButtons_.classList.remove('bdel');
	this.tweetButtons_.classList.remove('bret');
	this.tweetButtons_.classList.remove('bunret');
};

/**
 * Reset the tweet buttons
 */
twic.vcl.Timeline.prototype.resetButtons_ = function() {
	this.resetConfirm_();

	// @resource img/buttons/retweet.png
	this.tbRetweet_.src   = 'img/buttons/retweet.png';
	// @resource img/buttons/retweet_undo.png
	this.tbUnRetweet_.src = 'img/buttons/retweet_undo.png';
	// @resource img/buttons/delete.png
	this.tbDelete_.src    = 'img/buttons/delete.png';
	// @resource img/buttons/reply.png
	this.tbReply_.src     = 'img/buttons/reply.png';
};

/**
 * Clear the timeline
 */
twic.vcl.Timeline.prototype.clear = function() {
	this.list_.innerHTML = '';
	this.tweets_ = { };

	this.lastTweetId_['id'] = '';
	this.lastTweetId_['ts'] = 0;
	this.firstTweetId_['id'] = '';
	this.firstTweetId_['ts'] = 0;
};

/**
 * @param {Event} e Mouse event
 * @private
 */
twic.vcl.Timeline.prototype.doReply_ = function(e) {
	if (
		null === this.confirmerAction_
		&& this.hoveredTweet_
	) {
		e.stopPropagation();

		this.resetEditor();

		this.replyTweet_ = this.tweets_[this.hoveredTweet_.id];
		this.replyTweet_.reply(e && e.ctrlKey);

		this.hideButtons_();
	}
};

/**
 * Open the confirm dialog in the tweetButtons
 * @param {twic.vcl.Timeline.confirmAction} what
 * @private
 */
twic.vcl.Timeline.prototype.doConfirm_ = function(what) {
	this.confirmerAction_ = what;

	this.tweetButtons_.classList.add('bconfirm');

	if (what === twic.vcl.Timeline.confirmAction.ACTION_DELETE) {
		this.tweetButtons_.classList.add('bdel');
	} else
	if (what === twic.vcl.Timeline.confirmAction.ACTION_UNDO_RETWEET) {
		this.tweetButtons_.classList.add('bunret');
	} else
	if (what === twic.vcl.Timeline.confirmAction.ACTION_RETWEET) {
		this.tweetButtons_.classList.add('bret');
	}
};

/**
 * Add tweet to timeline
 * @param {string} id Tweet identifier
 * @param {number} ts Tweet timestamp
 * @return {!twic.vcl.Tweet}
 */
twic.vcl.Timeline.prototype.addTweet = function(id, ts) {
	var
		timeline = this,
		tweet = new twic.vcl.Tweet(id, this);

	this.tweets_[id] = tweet;

	tweet.onReplySend = function(editor, tweetText, replyTo, callback) {
		timeline.onReplySend.call(tweet, editor, tweetText, replyTo, callback);
	};

	if (
		this.isLoading_
		&& this.tweetBuffer_
	) {
		this.tweetBuffer_.appendChild(tweet.getElement());
	} else {
		if (
			ts > this.lastTweetId_['ts']
			&& id > this.lastTweetId_['id']
		) {
			this.list_.insertBefore(tweet.getElement(), this.list_.childNodes[0]);
		} else {
			this.list_.appendChild(tweet.getElement());
		}
	}

	if (
		ts > this.lastTweetId_['ts']
		&& id > this.lastTweetId_['id']
	) {
		this.lastTweetId_['id'] = id;
		this.lastTweetId_['ts'] = ts;
	}

	if (
		0 === this.firstTweetId_['ts']
		|| (
			id < this.firstTweetId_['id']
			&& ts < this.firstTweetId_['ts']
		)
	) {
		this.firstTweetId_['id'] = id;
		this.firstTweetId_['ts'] = ts;
	}

	return tweet;
};

/**
 * Reset the editor
 */
twic.vcl.Timeline.prototype.resetEditor = function() {
	if (this.replyTweet_) {
		this.replyTweet_.resetEditor();
	}
};

/**
 * Set the timeline user id
 * @param {number} id User identifier
 */
twic.vcl.Timeline.prototype.setUserId = function(id) {
	this.userId_ = id;
};

/**
 * @param {string} nick User nick
 */
twic.vcl.Timeline.prototype.setUserNick = function(nick) {
	this.userNick_ = nick;
};


/**
 * Get the timeline user id
 * @return {number} User identifier
 */
twic.vcl.Timeline.prototype.getUserId = function() {
	return this.userId_;
};

/**
 * @return {string} User nick
 */
twic.vcl.Timeline.prototype.getUserNick = function() {
	return this.userNick_;
};

/**
 * Get the last tweet identifier
 * @return {Object}
 */
twic.vcl.Timeline.prototype.getLastTweetId = function() {
	return this.lastTweetId_;
};

/**
 * Get the first tweet identifier
 * @return {Object}
 */
twic.vcl.Timeline.prototype.getFirstTweetId = function() {
	return this.firstTweetId_;
};

/**
 * Handler for tweet send process
 * @param {twic.vcl.TweetEditor} editor Editor
 * @param {string} tweetText Tweet text
 * @param {string=} replyTo Reply to tweet
 * @param {function()=} callback Callback
 */
twic.vcl.Timeline.prototype.onReplySend = function(editor, tweetText, replyTo, callback) { };

/**
 * Handler for the retweet
 * @param {number} userId User id
 * @param {string} tweetId Tweet id
 * @param {function()=} callback Callback
 */
twic.vcl.Timeline.prototype.onRetweet = function(userId, tweetId, callback) { };

/**
 * Handler for the delete
 * @param {number} userId User id
 * @param {string} tweetId Tweet id
 * @param {function()=} callback Callback
 */
twic.vcl.Timeline.prototype.onDelete = function(userId, tweetId, callback) { };

/**
 * Handler for the oldstyle retweet
 * @param {string} tweetText Tweet text
 */
twic.vcl.Timeline.prototype.onOldRetweet = function(tweetText) { };

/**
 * Get the suggest list
 * @param {string} startPart Start part of the nick
 * @param {function(Array)} callback Callback function
 */
twic.vcl.Timeline.prototype.onReplierGetSuggestList = function(startPart, callback) {
	callback( [ ] );
};
