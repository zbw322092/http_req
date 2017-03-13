var url = require('url');
var assert = require('assert');
var http = require('http');
var https = require('https');
var Writable = require('stream').Readable;

var nativeProtocols = {
	'http:': http,
	'https:': https,
};
var safeMethods = {
	GET: true, 
	HEAD: true, 
	OPTIONS: true, 
	TRACE: true
};

var schemes = {};

var exports = module.exports = {
	maxRedirects: 21
};

var eventHandles = Object.create(null);
['abort', 'aborted', 'error', 'socket'].forEach(function (event) {
	eventHandles[event] = function (arg) {
		this._redirectable.emit(event, arg);
	};
});


function RedirectableRequest(options, responseCallback) {
	Writable.call(this);
	this._options = options;
	this._redirectCount = 0;
	this._bufferedWrites = [];

	if (responseCallback) {
		this.on('response', responseCallback);
	}

	var self = this;
	this._onNativeResponse = function(response) {
		self._processResponse(response);
	};

	this._performRequest();
}

RedirectableRequest.prototype = Object.create(Writable.prototype);

RedirectableRequest.prototype._performRequest = function() {
	var protocol = this._options.protocol;
	// if (this._options.agents) {
	// 	this._options.agent = this._options.agents[]
	// }

	var nativeProtocol = nativeProtocols[this._options.protocol];
	var request = this._currentRequest = 
		nativeProtocol.request(this._options, this._onNativeResponse);

	this._currentUrl = url.format(this._options);

	request._redirectable = this;
	for (var event in eventHandles) {
		if (event) {
			request.on(event, eventHandles[event]);
		}
	}

	if (this._isRedirect) {
		var bufferedWrites = this._bufferedWrites;
		if (bufferedWrites.length === 0) {
			request.end();
		} else {
			var i = 0;
			(function writeNext() {
				if (i < bufferedWrites.length) {
					var bufferedWrite = bufferedWrites[i++];
					request.write(bufferedWrite.data, bufferedWrite.encoding, writeNext);
				} else {
					request.end();
				}
			})();
		}
	}

};

RedirectableRequest.prototype._processResponse = function(response) {
	var location = response.headers.location;
	if (location && this._options.followRedirects !== false &&
		response.statusCode >= 300 && response.statusCode < 400) {
		if (++this._redirectCount > this._options.maxRedirects) {
			return this.emit('error', new Error('Max redirects exceeded.'));
		}

		var header;
		var header = this._options.headers;
		if (response.statusCode !== 307 && !(this._options.method in safeMethods)) {
			this._options.method = 'GET';

			this._bufferedWrites = [];
			for (header in headers) {
				if (/^content-/i.test(header)) {
					delete headers[header];
				}
			}
		}

		if (!this._isRedirect) {
			for (header in headers) {
				if (/^host$/i.test(header)) {
					delete headers[header];
				}
			}
		}

		var redirectUrl = url.resolve(this._currentUrl, location);

		Object.assign(this._options, url.parse(redirectUrl));
		this._isRedirect = true;
		this._performRequest();
	} else {
		response.responseUrl = this._currentUrl;
		this.emit('response', response);

		delete this._options;
		delete this._bufferedWrites;
	}
};

// Aborts the current native request
RedirectableRequest.prototype.abort = function () {
	this._currentRequest.abort();
};

// Flushes the headers of the current native request
RedirectableRequest.prototype.flushHeaders = function () {
	this._currentRequest.flushHeaders();
};

// Sets the noDelay option of the current native request
RedirectableRequest.prototype.setNoDelay = function (noDelay) {
	this._currentRequest.setNoDelay(noDelay);
};

// Sets the socketKeepAlive option of the current native request
RedirectableRequest.prototype.setSocketKeepAlive = function (enable, initialDelay) {
	this._currentRequest.setSocketKeepAlive(enable, initialDelay);
};

// Sets the timeout option of the current native request
RedirectableRequest.prototype.setTimeout = function (timeout, callback) {
	this._currentRequest.setTimeout(timeout, callback);
};

RedirectableRequest.prototype._write = function(data, encoding, callback) {
	this._currentRequest.write(data, encoding, callback);
	this._bufferedWrites.push({
		data: data,
		encoding: encoding
	});
};

RedirectableRequest.prototype.end = function(data, encoding, callback) {
	this._currentRequest.end(data, encoding, callback);
	if (data) {
		this._bufferedWrites.push({
			data: data,
			encoding: encoding
		});
	}
};

Object.keys(nativeProtocols).forEach(function(protocol) {
	var scheme = scheme[protocol] = protocol.substr(0, protocol.length - 1);
	var nativeProtocol = nativeProtocols[protocol];
	var wrappedProtocol = exports[scheme] = Object.create(nativeProtocol);

	wrappedProtocol.request = function(options, callback) {
		if (typeof options === 'string') {
			options = url.parse(options);
			options.maxRedirects = exports.maxRedirects;
		} else {
			options = Object.assign({
				maxRedirects: exports.maxRedirects,
				protocol: protocol
			}, options);
		}

		assert.equal(options.protocol, protocol, 'protocol mismatch');

		return new RedirectableRequest(options, callback);
	};

	wrappedProtocol.get = function(options, callback) {
		var request = wrappedProtocol.request(options, callback);
		request.end();
		return request;
	};
});


























