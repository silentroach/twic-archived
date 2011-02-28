/**
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

( function() {

	var
		/** @type {HTMLElement}      */ timeline = document.querySelector('#timeline'),
		/** @type {HTMLUListElement} */ list = document.querySelector('#timeline ul');

	var buildList = function(data) {
		console.dir(data);

		var frag = document.createDocumentFragment();

		for (var id in data) {
			var 
				item      = data[id],
				li        = document.createElement('li'),
				avatarEl  = document.createElement('img'),
				nickEl    = document.createElement('p'),
				messageEl = document.createElement('p'),
				clearEl   = document.createElement('div');

			avatarEl.src        = item['user']['avatar'];
			avatarEl.className  = 'avatar';
			
			nickEl.innerHTML    = '@' + item['user']['name'];
			messageEl.innerHTML = item['msg'];
			
			clearEl.className = 'clearer';

			li.appendChild(avatarEl);
			li.appendChild(nickEl);
			li.appendChild(messageEl);
			li.appendChild(clearEl);

			frag.appendChild(li);
		}

		list.appendChild(frag);
	};

	twic.router.handle('timeline', function(data) {
		if (
			!data.length
			|| 1 !== data.length
		) {
			// todo return to the accounts list screen
			return;
		}

		// make popup 60% of screen height
		timeline.style.height = Math.round(screen.height / 100 * 60) + 'px';

		var id = data[0];

		twic.requests.send('getTimeline', {
			'id': id
		}, function(list) {
			if (list) {
				buildList(list);
			}
		} );
	} );

} )();
