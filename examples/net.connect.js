const net = require('net');

const server = net.createServer((c) => {
	console.log('client connected');
	c.on('end', () => {
		console.log('client disconnected');
	});
	c.write('hello\n');
	c.pipe(c);
});

server.on('error', (err) => {
	throw err;
});

server.listen(8124, () => {
	console.log('server bound');
});

server.on('clientClosed', () => {
	server.unref();
	console.log('server is unreferred');
});


setTimeout(() => {
	const client = net.connect({
		port: 8124,
		// path: '/tmp/echo.sock'
	}, () => {
		console.log('connected to server!');
		client.write('world!\r\n');
	});

	client.on('data', (data) => {
		console.log('client data: ', data.toString());
		client.end();
	});

	client.on('end', () => {
		console.log('disconnected from server');
		server.emit('clientClosed');
	});
}, 3000);
