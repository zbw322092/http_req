var http = require('../http.js');
var chalk = require('chalk');

var options = {
	hostname: 'localhost',
	port: 1334,
	path: '/redirect',
	method: 'POST'
};

var options2 = {
	hostname: 'localhost',
	port: 1334,
	path: '/example',
	method: 'GET'
};


// var request = http.request(options, function(res) {
// 	console.log(chalk.red(`response status code is ${res.statusCode}`));
// 	res.on('data', function(chunk) {
// 		console.log(chalk.green(`response data is ${chunk}`));
// 	});
// });

var request2 = http.request(options2, function(res) {
	console.log(chalk.red(`response status code is: ${res.statusCode}`));
	res.on('data', function(chunk) {
		console.log(chalk.green(`response data is: ${chunk}`));
	});
});

// request.end();
request2.end();