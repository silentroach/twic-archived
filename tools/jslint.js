var
	JSLINT = require('./jslint/fulljslint').JSLINT,
	print = require('sys').print,
	src = require('fs').readFileSync('../src/js/init.js', 'utf8');

JSLINT(src, {
	evil: true,
	forin: true,
	maxerr: 100
} );
