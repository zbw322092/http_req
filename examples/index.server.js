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

	// console.log(req instanceof http.IncomingMessage); // true
	// console.log(req instanceof stream.Readable); // true
	if (req.method === 'POST' && reqUrl.path === '/example') {
		console.log(reqUrl.path);
		var body = 'I am the server';
	  res.writeHead(200, {
	  	'Content-Type': 'text/plain',
	  	'Content-Length': Buffer.byteLength(body)
	  });
	  res.write(body, 'utf8');
	  res.end();
	} else if (req.method === 'POST' && reqUrl.path === '/redirect') {
		console.log(reqUrl.path);
		var body = 'Redirect to new path';
	  res.writeHead(301, {
	  	'Content-Type': 'text/plain',
	  	'Content-Length': Buffer.byteLength(body),
	  	'Location': './new_path'
	  });
	  res.write(body, 'utf8');
	  res.end();
	} else if (req.method === 'GET' && reqUrl.path === '/new_path') {
		console.log(reqUrl.path);
		var body = 'see you again';
	  res.writeHead(301, {
	  	'Content-Type': 'text/plain',
	  	'Content-Length': Buffer.byteLength(body),
	  	'Location': '/new_path'
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