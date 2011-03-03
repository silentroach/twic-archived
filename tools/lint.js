var
	JSLINT = require('./jslint/fulljslint').JSLINT,
	rdir = require('fs').readdirSync,
	print = require('sys').print,
	stat = require('fs').statSync,
	rf = require('fs').readFileSync,
	errorCount = 0,
	maxErrorCount = 10;

var testFile = function(path) {
	var src = rf(path, 'utf8');

	print('=== Checking ' + path + "...\n");

	JSLINT(src, {
		evil: false,
		forin: true,
		sub: true,
		es5: true,
		fragment: true,
		maxerr: maxErrorCount
	} );

	var 
		e = JSLINT.errors,
		err;

	if (e.length > 0) {
		print("\n");
	}

	for (var i = 0; i < e.length; ++i) {
		err = e[i];

		if (err) {
			++errorCount;
			print(err.evidence + "\n");
			print('  Problem at line ' + err.line + ': ' + err.reason + "\n");

			if (errorCount >= maxErrorCount) {
				process.exit(1);
			}
		}
	}

	if (e.length > 0) {
		print("\n");
	}
}

var testDir = function(path) {
	var entries = rdir(path);

	for (var i = 0; i < entries.length; ++i) {
		var 
			entry = entries[i],
			ename = path + '/' + entry,
			st = stat(ename);

		if (st.isDirectory()) {
			testDir(ename);
		} else
		if (
			st.isFile()
		) {
			testFile(ename);
		}
	}
}

testDir('src/js');
