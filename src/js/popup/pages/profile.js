/**
 * Profile page implementation
 *
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

// todo annotations
( function() {

	var
		page,
		elementLoader,
		elementAvatar,
		elementName,
		elementNick,
		elementUrl,
		elementBio,
		elementLocation,
		elementFollowings,
		elementFollowed,
		elementFollowedSpan,
		timelineUserId,
		profileUserId,
		loader,
		toolbarTimeline;

	var initPage = function() {
		page = twic.dom.find('#profile');

		elementFollowings   = twic.dom.find('#followings');
		elementFollowed     = twic.dom.find('p', elementFollowings);
		elementFollowedSpan = twic.dom.find('span', elementFollowings);

		elementLoader   = twic.dom.find('.loader', page);
		elementAvatar   = twic.dom.find('.avatar', page);
		elementName     = twic.dom.find('.name', page);
		elementNick     = twic.dom.find('.nick', page);
		elementUrl      = twic.dom.find('.url', page);
		elementBio      = twic.dom.find('.bio', page);
		elementLocation = twic.dom.find('.location', page);
		toolbarTimeline = twic.dom.find('.toolbar a', page);
	};

	var clearProfileData = function() {
		elementFollowedSpan.className = '';
		elementFollowed.className = '';
		elementLoader.style.display = 'block';
		elementAvatar.style.display = 'none';
		elementFollowings.style.display = 'none';
		elementAvatar.src = '';
		elementName.innerHTML = '';
		elementNick.innerHTML = '';
		elementUrl.innerHTML = '';
		elementBio.innerHTML = '';
		elementBio.style.display = 'none';
		elementLocation.innerHTML = '';
		elementLocation.style.display = 'none';
		elementFollowedSpan.innerHTML = '';
	};

	var follow = function() {
		elementFollowedSpan.className = 'loading';

		twic.requests.send('follow', {
			'id': timelineUserId,
			'whom_id': profileUserId
		}, function() {
			showProfileFriendship(true);
		} );
	};

	var unfollow = function() {
		elementFollowedSpan.className = 'loading';

		twic.requests.send('unfollow', {
			'id': timelineUserId,
			'whom_id': profileUserId
		}, function() {
			showProfileFriendship(false);
		} );
	};

	var unfollowOver = false;

	var onFollowedMouseOver = function() {
		if (!unfollowOver) {
			unfollowOver = true;
			elementFollowedSpan.innerHTML = twic.utils.lang.translate('button_unfollow');
		}
	};

	var onFollowedMouseOut = function() {
		if (unfollowOver) {
			unfollowOver = false;
			elementFollowedSpan.innerHTML = twic.utils.lang.translate('button_following');
		}
	};

	var showProfileFriendship = function(following) {
		elementFollowedSpan.className = '';

		if (following) {
			elementFollowed.className = 'following';
			elementFollowed.onclick = unfollow;
			elementFollowed.onmouseover = onFollowedMouseOver;
			elementFollowed.onmouseout = onFollowedMouseOut;
			elementFollowedSpan.innerHTML = twic.utils.lang.translate('button_following');
		} else {
			elementFollowed.className = '';
			elementFollowed.onclick = follow;
			elementFollowed.onmouseover = null;
			elementFollowed.onmouseout = null;
			elementFollowedSpan.innerHTML = twic.utils.lang.translate('button_follow');
		}

		elementFollowings.style.display = 'block';
	};

	var showProfile = function(data) {
		var
			/** @type {Element} **/ marginElement,
			/** @type {string} **/  description = data['description'],
			/** @type {string} **/  loc = data['location'],

		profileUserId = data['id'];

		// fixme shitcode
		elementAvatar.src = data['avatar'];
		elementAvatar.title = '@' + data['screen_name'];
		elementAvatar.style.display = '';
		elementName.innerHTML = data['name'];
		elementNick.innerHTML = data['screen_name'];

		if (data['url'] !== '') {
			elementUrl.innerHTML = twic.utils.url.humanize(data['url']);
		}

		if (description.trim() !== '') {
			// todo prepare the text as a tweet
			elementBio.innerHTML = description;
			elementBio.style.display = 'block';
			marginElement = elementBio;
		}

		if (loc.trim() !== '') {
			elementLocation.innerHTML = loc;
			elementLocation.style.display = 'block';
			marginElement = elementLocation;
		}

		if (marginElement) {
			marginElement.style.marginTop = '1em';
		}

		if (
			!timelineUserId
			|| timelineUserId === data['id']
		) {
			elementLoader.style.display = 'none';
		} else {
			twic.requests.send('getProfileFriendshipInfo', {
				'source_id': timelineUserId,
				'target_id': data['id']
			}, function(data) {
				elementLoader.style.display = 'none';
				showProfileFriendship(data['following']);
				elementFollowings.style.display = 'block';
			} );
		}
	};

	twic.router.handle('profile', function(data) {
		var
			router = this,
			prev = router.previous(),
			/** @type {string} **/ prevPage = prev.shift(),
			/** @type {string} **/ userName;

		router.initOnce(initPage);

		toolbarTimeline.href = '#' + prevPage;

		if (prevPage === 'about') {
			toolbarTimeline.innerHTML = twic.utils.lang.translate('title_about');
			timelineUserId = null;
		} else {
			toolbarTimeline.innerHTML = twic.dom.find('#timeline .toolbar p').innerHTML;
			toolbarTimeline.href += '#' + prev.join('#');
			// fixme shitcode
			timelineUserId = parseInt(prev[0], 10);
		}

		if (
			!data.length
			|| 1 !== data.length
		) {
			// todo return to the accounts list screen
			return;
		}

		userName = data[0];

		// update info if it is not loaded yet
		var pageUserName = page.getAttribute('username');
		if (pageUserName !== userName) {
			clearProfileData();

			page.setAttribute('username', userName);

			twic.requests.send('getProfileInfo', {
				'name': userName
			}, showProfile);
			// todo or show an error
		}
	} );

}() );
