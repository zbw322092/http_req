var net = require('net');

var server = net.createServer((socket) => {
	socket.end('goodbye\n');
}).on('error', (err) => {
	throw err;
});

server.listen(() => {
	console.log('opened server on', server.address());
});