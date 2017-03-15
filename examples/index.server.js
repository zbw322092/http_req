var http = require('http');

var server = http.createServer(function(req, res) {
	var body = 'I am the server';
  res.writeHead(200, {
  	'Content-Type': 'text/plain',
  	'Content-Length': Buffer.byteLength(body)
  });
  res.write(body, 'utf8');
  res.end();
});

server.listen(1334, () => {
	console.log('server is listening on port 1334');
});