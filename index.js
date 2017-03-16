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
var chalk = require('chalk');

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

var safeMethods = {
	GET: true, 
	HEAD: true, 
	OPTIONS: true, 
	TRACE: true
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





var protocols = {
	'http:': http,
	'https:': https
};

var schemes = {};

var eventHandles = Object.create(null);
['abort', 'aborted', 'error', 'socket'].forEach(function(event) {
	eventHandles[event] = function(arg) {
		// 'this' here points to eventHandles object, we can sign value to
		// this._redirectable to change the point.
		this._redirectable.emit(event, arg);
	};
});

function HttpRequest(options, responseCallback) {
	Writable.call(this);
	this._options = options;
	this.redirectTimes = 0;
	this.defaultMaxRedirectTimes = 20;
	this._bufferedWrites = [];

	if (responseCallback) {
		this.on('response', responseCallback);
	}

	this._proformRequest();
}

HttpRequest.prototype = Object.create(Writable.prototype);

HttpRequest.prototype._proformRequest = function() {
	var nativeProtocol = protocols[this._options.protocol] || http;
	this.originReqUrl = url.format(this._options);

	this._redirectable = this;
	var self = this;
	// if do not use 'bind' method here, 'this' in _processResponse method will be bound to 
	// the object http.request returned, which in this case is nativeRequest.
	var nativeRequest = this._currentRequest =
		http.request(this._options, this._processResponse.bind(self));

	var bufferedWrites = this._bufferedWrites;
	if (bufferedWrites.length) {
		nativeRequest.end();
	} else {
		var i = 0;
		(function writeBuffer() {
			if (i++ < bufferedWrites.length) {
				nativeRequest.write(bufferedWrites[i].data, bufferedWrites[i].encoding, writeBuffer);
			} else {
				nativeRequest.end();
			}
		})();
	}
};

HttpRequest.prototype._processResponse = function(res) {
	var location = res.headers.location;
	console.log(res.statusCode);
	if (res.statusCode >= 300 && res.statusCode < 400 && location) {
		++this.redirectTimes;

		// if redirect times exceed max redirect time, emit an error event
		if (this.redirectTimes > (this._options.maxRedirectTimes || 
			this.defaultMaxRedirectTimes)) {
			return this.emit('error', new Error('Max redirects exceeded.'));			
		}

		var header;
		var headers = this._options.headers;
		if (res.statusCode !== 307 && !(this._options.method in safeMethods)) {
			this._options.method = 'GET';
			// delete entity related http headers
			for (header in headers) {
				if (/^content-/i.test(header)) {
					delete headers[header];
				}
			}
		}

		// redirection may lead to different host
		for (header in headers) {
			if (/^host$/i.test(header)) {
				delete headers[header];
			}
		}


		// redirect
		var redirectUrl = url.resolve(this.originReqUrl, location);
		// console.log(redirectUrl);
		Object.assign(this._options, url.parse(redirectUrl));
		console.log(chalk.green(`It is the ${this.redirectTimes} times redirection\n`), this._options);
		this._proformRequest();

	} else {
		// otherwise, leave response alone, which means, we can pass the response to the request callback 
		// defined by package users
		this.emit('response', res);
	}

};

// Aborts the current native request
HttpRequest.prototype.abort = function () {
	this._currentRequest.abort();
};

// Flushes the headers of the current native request
HttpRequest.prototype.flushHeaders = function () {
	this._currentRequest.flushHeaders();
};

// Sets the noDelay option of the current native request
HttpRequest.prototype.setNoDelay = function (noDelay) {
	this._currentRequest.setNoDelay(noDelay);
};

// Sets the socketKeepAlive option of the current native request
HttpRequest.prototype.setSocketKeepAlive = function (enable, initialDelay) {
	this._currentRequest.setSocketKeepAlive(enable, initialDelay);
};

// Sets the timeout option of the current native request
HttpRequest.prototype.setTimeout = function (timeout, callback) {
	this._currentRequest.setTimeout(timeout, callback);
};

HttpRequest.prototype._write = function(data, encoding, callback) {
	this._currentRequest.write(data, encoding, callback);
	this._bufferedWrites.push({
		data: data,
		encoding: encoding
	});
};

HttpRequest.prototype.end = function(data, encoding, callback) {
	this._currentRequest.end(data, encoding, callback);
	this._bufferedWrites.push({
		data: data,
		encoding: encoding
	});
};

Object.keys(protocols).forEach(function(protocol) {
	var scheme = schemes[protocol] = protocol.substr(0, protocol.length - 1);
	var nativeProtocol = protocols[protocol];
	// wrappedProtocol is an object whose __proto__ points to http/https
	var wrappedProtocol = exports[scheme] = Object.create(nativeProtocol);
	
	wrappedProtocol.request = function(options, callback) {
		if (typeof options === 'string') {
			options = url.parse(options);

		} else {
			options = Object.assign({
				protocol: protocol
			}, options);
		}

		return new HttpRequest(options, callback);
	};

	wrappedProtocol.get = function(options, callback) {
		var request = wrappedProtocol.request(options, callback);
		request.end();
		return request;
	};

});



// var r = new HttpRequest(options);






























