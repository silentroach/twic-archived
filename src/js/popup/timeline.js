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

		var 
			frag = document.createDocumentFragment(),
			prevUserId = -1,
			lastLi = undefined;

		for (var id in data) {
			var 
				item      = data[id],
				useOld    = prevUserId == item['user']['id'],
				li        = useOld && lastLi ? lastLi : document.createElement('li'),
				messageEl = document.createElement('p'),
				clearEl   = document.createElement('div');
				
			if (!useOld) {
				var
					avatarEl  = document.createElement('img'),
					nickEl    = document.createElement('p');
			
				avatarEl.src        = item['user']['avatar'];
				avatarEl.className  = 'avatar';
				
				nickEl.innerHTML = '@' + item['user']['name'];
				
				li.appendChild(avatarEl);
				li.appendChild(nickEl);
				
				prevUserId = item['user']['id'];
				lastLi = li;
			}
			
			messageEl.innerHTML = item['msg'];
			messageEl.className = 'msg';
			
			clearEl.className = 'clearer';

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
