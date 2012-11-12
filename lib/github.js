// Github: http://developer.github.com/v3/

const https = require('https');

exports.print = function () {
  var options = {
    hostname: 'api.github.com',
    port: 443,
    path: '/repos/mozilla/browserid/issues?assignee=' + conf.get('github').username,
    method: 'GET'
  };
  var req = https.request(options, function (res) {
    var issueData = '';
    res.on('data', function (chunk) {
      issueData += chunk;
    });

    res.on('end', function () {
      process.stdout.write("GITHUB ISSUES\n");
  
      var issues = JSON.parse(issueData);
      issues.forEach(function (issue) {
        var issueURL = issue.url;
        var issueTitle = issue.title;
        process.stdout.write("  " + issueURL + ": " + issueTitle + "\n");
      });
    });
  });
  req.end();

  req.on('error', function (e) {
    console.error(e);
  });
};
