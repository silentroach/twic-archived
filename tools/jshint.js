var
	fs  = require('fs'),
	sys = require('util'),
	child = require('child_process');

var checkFile = function(filename) {
	child.exec('jshint ' + filename + ' --config jshint.json', function(error, stdout, stderr) {
		sys.print(stdout);
	} );
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
