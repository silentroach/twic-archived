/**
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

( function() {

	var
		/** @type {HTMLElement}      */ timeline = document.querySelector('#timeline'),
		/** @type {HTMLUListElement} */ list = document.querySelector('#timeline ul');

	var parseTweetText = function(text) {
		// preparing urls
		var txt = text.replace(
			/[A-Za-z]+:\/\/[A-Za-z0-9-_]+\.[A-Za-z0-9-_:%&\?\/.=]+/g,
			function(url) {
				var stripped = url;

				if (stripped.length > 30) {
					stripped = stripped.substring(0, 30) + '&hellip;';
				}

				return '<a target="_blank" href="' + url + '" title="' + url + '">' + stripped + '</a>';
			}
		);

		// preparing nicks
		txt = txt.replace(
			/(^|\s)@(\w+)/g,
			'$1<a class="nick" target="_blank" href="http://twitter.com/#!/$2">@$2</a>'
		);

		// preparing hashtags
		txt = txt.replace(
			/(^|\s)#(\w+)/g,
			'$1<a class="hash" target="_blank" href="http://search.twitter.com/search?q=%23$2">#$2</a>'
		);

		return txt;
	};

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
				li.id = id;
				
				prevUserId = item['user']['id'];
				lastLi = li;
			}
			
			messageEl.innerHTML = parseTweetText(item['msg']);
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
		//timeline.style.height = Math.round(screen.height / 100 * 60) + 'px';

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
