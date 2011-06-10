/**
 * Profile page implementation
 *
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

// todo annotations
( function() {

	var
		coordsRegExp = /(-?\d+\.\d+),(-?\d+\.\d+)/,
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
		elementDirect,
		timelineUserId,
		profileUserId,
		loader,
		toolbarTimeline,
		directLinkBase;

	var initPage = function() {
		page = twic.dom.findElement('#profile');

		elementFollowings   = twic.dom.findElement('#followings');
		elementFollowed     = twic.dom.findElement('p', elementFollowings);
		elementFollowedSpan = twic.dom.findElement('span', elementFollowings);

		elementDirect   = twic.dom.findElement('.toolbar p a', page);
		elementDirect.title = twic.utils.lang.translate('title_directly');
		directLinkBase  = elementDirect.href;

		elementLoader   = twic.dom.findElement('.loader', page);
		elementAvatar   = twic.dom.findElement('.avatar', page);
		elementName     = twic.dom.findElement('.name', page);
		elementNick     = twic.dom.findElement('.nick', page);
		elementUrl      = twic.dom.findElement('.url', page);
		elementBio      = twic.dom.findElement('.bio', page);
		elementLocation = twic.dom.findElement('.location', page);
		toolbarTimeline = twic.dom.findElement('.toolbar a', page);
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

		twic.requests.makeRequest('follow', {
			'id': timelineUserId,
			'whom_id': profileUserId
		}, function() {
			showProfileFriendship(true);
		} );
	};

	var unfollow = function() {
		elementFollowedSpan.className = 'loading';

		twic.requests.makeRequest('unfollow', {
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
			/** @type {string} **/  loc = data['location'];

		profileUserId = data['id'];

		// fixme shitcode
		elementAvatar.src = data['avatar'].replace('_normal.', '_bigger.');
		elementAvatar.title = '@' + data['screen_name'];
		elementAvatar.style.display = '';
		elementName.innerHTML = data['name'];
		elementNick.innerHTML = data['screen_name'];

		elementDirect.href = directLinkBase + data['screen_name'];

		if (data['url'] !== '') {
			elementUrl.innerHTML = twic.utils.url.humanize(data['url']);
		}

		if (loc.trim() !== '') {
			elementLocation.style.display = 'block';
			marginElement = elementLocation;

			// trying to find the coordinates
			var coords = coordsRegExp.exec(loc);
			if (
				coords
				&& 3 === coords.length
			) {
				var coordsData = coords.shift();

				loc += '<br /><br /><center>' +
					'<iframe class="map" src="http://www.google.com/uds/modules/elements/mapselement/iframe.html?maptype=roadmap' +
					'&latlng=' + encodeURIComponent(coordsData) +
					'&zoom=16&element=true"></iframe></center>';
			}

			elementLocation.innerHTML = loc;
		}

		if (description.trim() !== '') {
			// todo prepare the text as a tweet
			elementBio.innerHTML = twic.utils.url.processText(description);
			elementBio.style.display = 'block';
			marginElement = elementBio;
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
			twic.requests.makeRequest('getProfileFriendshipInfo', {
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

			// trying to find if we are using just one account
			var
				tmpList = document.querySelectorAll('#accounts ul li a');

			if (tmpList.length === 1) {
				timelineUserId = parseInt(tmpList[0].id, 10);
			} else {
				timelineUserId = null;
			}
		} else {
			toolbarTimeline.innerHTML = twic.dom.findElement('#timeline .toolbar p').innerHTML;
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

			twic.requests.makeRequest('getProfileInfo', {
				'name': userName
			}, showProfile);
			// todo or show an error
		}
	} );

}() );
