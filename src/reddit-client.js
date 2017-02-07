'use strict';
var https = require('https');

/**
 * Calls the reddit api  with the given subreddit path. Returns the parsed JSON object.
**/
exports.call = function(subredditPath, successCallback, errorCallback) {
    var options = {
      host: 'api.reddit.com',
      port: 443,
      path: '/' + subredditPath,
      method: 'GET',
      headers: {'user-agent': 'reddit-sdk-1.0', 'accept': '*/*' }
    };

    var req = https.get(options, function(res) {
      let body = '';
      console.log("status code: " + res.statusCode);
      if (res.statusCode != 200) {
        errorCallback("Error calling Reddit.");
      }
      res.on('data', function(d) {
        body += d;
      });

      res.on('end', function() {
        var parsed = JSON.parse(body);
        successCallback(parsed);
      })
    });

    req.on('error', function(e) {
      console.error(e);
      errorCallback(e);
    });
};






