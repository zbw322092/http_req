var Readable = require('stream').Readable;
var util = require('util');
var fs = require('fs');

var readableFile = fs.createReadStream(__dirname + '/file.json');
readableFile.on('readable', function(chunk) {
	var chunk;
	if (null !== (chunk = readableFile.read())) {
		console.log(`Receive ${chunk.length} bytes of data`);
	}
});



