// self implemented version of http request redirection
// It is a package which deals with the http client side logic which relates to Redirection
// programming logics:
// 1. send a request to server
// 2. check whether redirect headers are sent back
// 			2.1 if yes, check whether the maximal redirect times has been reached
// 				2.1.1 if yes, throw error
// 				2.1.2 if no, resend http request
// 			2.2 if no, return as normal
var http = require('http');
var https = require('https');
var querystring = require('querystring');

var postData = querystring.stringify({
	'msg': 'Hello World'
});

var options = {
	protocol: 'http:',
	hostname: 'localhost',
	port: 1334,
	method: 'GET',
	path: '/example',
	headers: {
		'Content-Type': 'text/plain'
	}
};
var request = http.request(options, function(res) {
	console.log(`STATUS: ${res.statusCode}`);
	console.log(`HEADERS: ${JSON.stringify(res.headers)}`);

	res.setEncoding('utf8');
	res.on('data', (chunk) => {
		console.log(`Received ${chunk.length} bytes of data.`);
	});
	res.on('end', () => {
		console.log('There will be no more data.');
	});
});

request.on('error', (err) => {
	console.log(`problem with request: ${err.message}`);
});

request.write(postData);
request.end();


















