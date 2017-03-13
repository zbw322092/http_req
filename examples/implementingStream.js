var Readable = require('stream').Readable;
var util = require('util');
var fs = require('fs');
var chalk = require('chalk');

var readableFile = fs.createReadStream(__dirname + '/file.json');
readableFile.setEncoding('utf8');
// readableFile.on('readable', function(chunk) {
// 	var chunk;
// 	if (null !== (chunk = readableFile.read())) {
// 		console.log(`Receive ${chunk.length} bytes of data`);
// 	}
// });

var MyStream = function(options) {
	Readable.call(this, options);
	this.counter = 1000;
};

util.inherits(MyStream, Readable);

MyStream.prototype._read = function() {
	this.push('foobar');
	if (this.counter-- === 0) {
		this.push(null);
	}
};

var mystream = new MyStream();
mystream.pipe(process.stdout);













