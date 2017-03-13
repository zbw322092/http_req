var querystring = require('querystring');
var http = require('http');
var url = require('url');

var reqUrl = 'http://nodejs.org/dist/index.json';
var options = {
  protocol: url.parse(reqUrl).protocol,
  hostname: url.parse(reqUrl).hostname,
  path: url.parse(reqUrl).pathname,
  method: 'GET'
};

var req = http.request(options, function(res) {
  console.log(`STATUS: ${res.statusCode}`);
  console.log(`HEADERS: ${JSON.stringify(res.headers)}`);

  res.setEncoding('utf8');
  res.on('data', function(chunk) {
    console.log(`Body: ${chunk}`);
  });
  res.on('end', function() {
    console.log('No more data in response.');
  });

});

req.on('error', function(e) {
  console.log(`Got error: ${e.message}`);
});

req.end();