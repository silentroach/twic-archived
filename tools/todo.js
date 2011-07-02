var
	fs  = require('fs'),
	sys = require('sys'),

	commentPattern = /[//|*] ?(fixme|todo)(.*?)$/mig;

var checkFile = function(filename) {
	var
		content    = fs.readFileSync(filename, 'utf-8'),
		introduced = false,
		comments;

	while (comments = commentPattern.exec(content)) {
		var
			comment = comments[2].trim(),
			idx     = content.substring(0, comments.index).split("\n").length;

		if (!introduced) {
			sys.print("\033[1m" + filename + "\033[0m\n");

			introduced = true;
		}

		sys.print('  Line ' + idx + ': ' + comment + "\n");
	}

	if (introduced) {
		sys.print("\n");
	}
};

var checkDir = function(path) {
	var
		entries = fs.readdirSync(path),
		i;

	for (var i = 0; i < entries.length; ++i) {
		var
			entry = entries[i],
			ename = path + '/' + entry,
			st = fs.statSync(ename);

		if (
			'3rdparty' !== entry
			&& st.isDirectory()
		) {
			checkDir(ename);
		} else
		if (
			st.isFile()
			&& '.js' === ename.substring(ename.length - 3)
		) {
			checkFile(ename);
		}
	}
};

checkDir('src/js');
