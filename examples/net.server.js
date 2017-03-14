var net = require('net');

var server = net.createServer((socket) => {
	socket.end('goodbye\n');
}).on('error', (err) => {
	throw err;
});

server.listen({
	port: 1337
} ,() => {
	console.log('opened server on', server.address());
});

server.on('connection', (socket) => {
	server.getConnections((err, count) => {
		if (err) throw err;
		console.log('connections amount:', count);
	});
});

server.on('error', (e) => {
	if (e.code === 'EADDRINUSE') {
		console.log('Address in use, retrying...');
		setTimeout(() => {
			server.close();
			server.listen(() => {
				console.log('opened server on', server.address());
			});
		}, 1000);
	}
});

setTimeout(() => {
	console.log('connection is unreferred');
	server.unref();
}, 10000);