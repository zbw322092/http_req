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
var path = require('path');
var Writable = require('stream').Writable;
var querystring = require('querystring');
var url = require('url');

var postData = querystring.stringify({
	'msg': 'Hello World'
});

var options = {
	protocol: 'http:',
	hostname: 'localhost',
	port: 1334,
	method: 'POST',
	path: '/redirect',
	headers: {
		'Content-Type': 'text/plain'
	}
};
// http.request usage:
/*
var request = http.request(options, function(res) {
	console.log(`STATUS: ${res.statusCode}`);
	console.log(`HEADERS: ${JSON.stringify(res.headers)}`);

	res.setEncoding('utf8');
	res.on('data', (chunk) => {
		console.log(`Server Response: ${chunk}`);
		console.log(`Received ${chunk.length} bytes of data.`);
	});
	res.on('end', () => {
		console.log('There will be no more data.');
	});

	if (res.statusCode >= 300 && res.statusCode < 400 &&
		res.headers.location) {
		var originReqUrl = path.format(options);
		var location = res.headers.location;
		var redirectUrl = url.resolve(originReqUrl, location);
		http.request(url.parse(redirectUrl));
	}
});

request.on('error', (err) => {
	console.log(`problem with request: ${err.message}`);
});

request.write(postData);
request.end();
 */

var g;



var protocols = {
	'http:': http,
	'https:': https
};

function HttpRequest(options) {
	Writable.call(this);
	this._options = options;
	this.redirectTimes = 0;
	this.defaultMaxRedirectTimes = 20;

	this._proformRequest();
}

HttpRequest.prototype._proformRequest = function() {
	var nativeProtocol = protocols[this._options.protocol] || http;
	this.originReqUrl = url.format(this._options);
	var self = this;
	// if do not use 'bind' method here, 'this' in _processResponse method will be bound to 
	// the object http.request returned, which in this case is nativeRequest.
	var nativeRequest = http.request(this._options, this._processResponse.bind(self));
	nativeRequest.end();
};

HttpRequest.prototype._processResponse = function(res) {
	console.log(`response statusCode is ${res.statusCode}`);
	if (res.statusCode >= 300 && res.statusCode < 400 &&
		res.headers.location) {
		++this.redirectTimes;
		if (this.redirectTimes < (this._options.maxRedirectTimes || 
			this.defaultMaxRedirectTimes)) {
			// redirect
			var redirectUrl = url.resolve(this.originReqUrl, res.headers.location);
			// console.log(redirectUrl);
			this._options = Object.assign(this._options, url.parse(redirectUrl));
			console.log(this._options, 'aaaaaaaa');
			this._proformRequest();
		} else {
			throw Error('Max redirects exceeded.');
		}


	} else {
		console.log('Request Successful');
	}

};

var r = new HttpRequest(options);






























