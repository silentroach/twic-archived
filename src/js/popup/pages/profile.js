/**
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */
( function() {

	var
		page = document.getElementById('profile'),
		elementAvatar   = page.querySelector('.avatar'),
		elementName     = page.querySelector('.name'),
		elementNick     = page.querySelector('.nick'),
		elementUrl      = page.querySelector('.url'),
		toolbarTimeline = page.querySelector('.toolbar a');

	var clearProfileData = function() {
		elementAvatar.style.display = 'none';
		elementAvatar.src = '';
		elementName.innerHTML = '';
		elementNick.innerHTML = '';
		elementUrl.innerHTML = '';
	};

	var showProfile = function(data) {
		elementAvatar.src = data['avatar'];
		elementAvatar.style.display = '';
		elementName.innerHTML = data['name'];
		elementNick.innerHTML = data['screen_name'];
		elementUrl.innerHTML = '<a href="' + data['url'] + '">' + data['url'] + '</a>';
	};

	twic.router.handle('profile', function(data) {
		var prev = this.previous();

		toolbarTimeline.innerHTML = document.querySelector('#timeline .toolbar p').innerHTML;
		toolbarTimeline.href = '#' + prev.join('#');

		clearProfileData();

		if (
			!data.length
			|| 1 !== data.length
		) {
			// todo return to the accounts list screen
			return;
		}

		var userName = data[0];

		twic.requests.send('getProfileInfo', {
			'name': userName
		}, showProfile);
	} );

}() );
