var http = require('http');
var fs = require('fs');

var options = {
	hostname: 'localhost',
	port: 1400,
	method: 'GET',
	path: '/large_file',
	headers: {
		'Transfer-Encoding': 'chunked'
	}
};

var request = http.request(options, function(res) {
	console.log(`response code: ${res.statusCode}`);
});

var song = fs.createReadStream('./assets/Bob_Dylan-Tempest.mp3');
setTimeout(function() {
	request.end();
}, 100);
song.on('data', function(chunk) {
	request.write(chunk);
});
