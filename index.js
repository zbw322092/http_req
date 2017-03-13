var url = require('url');
var assert = require('assert');
var http = require('http');
var https = require('https');
var Writable = require('stream').Readable;

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