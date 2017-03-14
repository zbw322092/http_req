var url = require('url');
var querystring = require('querystring');

var postData = querystring.stringify({
  'msg' : 'Hello World!'
});

var options = {
  hostname: 'www.google.com',
  port: 80,
  path: '/upload',
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': Buffer.byteLength(postData)
  }
};

var formattedUrl = url.format(options);
console.log(formattedUrl); // //www.google.com:80

var resolvedUrl = url.resolve(formattedUrl, 'new');
console.log(resolvedUrl);

var parsedUrl = url.parse(resolvedUrl);
console.log(parsedUrl);