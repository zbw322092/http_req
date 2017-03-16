var http = require('http');
var fs = require('fs');
var chalk = require('chalk');


var server = http.createServer(function(req, res) {
	var totalData;
	req.on('data', function(chunk) {
		console.log(chalk.green(`the request chunk length is ${chunk.length}`));
		totalData += chunk;
	});
	req.on('end', function() {
		console.log(`total data length is: ${totalData.length}`);
		// console.log(chalk.red('no more data avaliable'));
	});
});

server.listen(1400, function() {
	console.log('server is listening on port 1400');
});

