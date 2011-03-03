var
	JSLINT = require('./jslint/fulljslint').JSLINT,
	print = require('sys').print,
	src = require('fs').readFileSync('../src/js/background/dbobject.js', 'utf8');

JSLINT(src, {
	evil: true,
	forin: true,
	maxerr: 100
} );

var 
	e = JSLINT.errors,
	w;

for (var i = 0; i < e.length; i++) {
	w = e[i];

	if (w) {
		print(w.evidence + "\n");
		print('  Problem at line ' + w.line + ': ' + w.reason + "\n");
	}
}
