var http = require('http');
var url = require('url');
var stream = require('stream');

var server = http.createServer(function(req, res) {
	var reqUrl = url.parse(req.url);
	req.on('data', (chunk) => {
		console.log(`Request data: ${chunk}`);
	});
	req.on('end', () => {
		console.log('Request End');
	});

	// console.log(req);
	console.log(req instanceof http.IncomingMessage); // true
	console.log(req instanceof stream.Readable); // true
	if (req.method === 'POST' && reqUrl.path === '/example') {
		var body = 'I am the server';
	  res.writeHead(200, {
	  	'Content-Type': 'text/plain',
	  	'Content-Length': Buffer.byteLength(body)
	  });
	  res.write(body, 'utf8');
	  res.end();		
	} else {
		res.writeHead(404, {
			'Content-Type': 'text/plain'
		});
		res.write('No Content');
		res.end();
	}

});

server.listen(1334, () => {
	console.log('server is listening on port 1334');
});