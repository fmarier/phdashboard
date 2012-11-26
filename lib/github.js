// Github: http://developer.github.com/v3/

const https = require('https');

exports.config =  {
  username: {
    doc: "Github username",
    format: 'string'
  }
};

var githubIssues = {
  0: [],
  1: [],
  2: [],
  3: [],
  4: [],
  5: []
};

function severity(issue) {
  for (label in issue.labels) {
    if (!issue.labels.hasOwnProperty(label)) {
      continue;
    }

    switch (issue.labels[label].name) {
      case '★':
        return 1;
      case '★★':
        return 2;
      case '★★★':
        return 3;
      case '★★★★':
        return 4;
      case '★★★★★':
        return 5;
    }
  }
  return 0; // unknown
}

function fetchIssues(cb) {
  var issueCount = 0;

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
        var parts = issue.url.split('/');
        var issueNumber = parts[parts.length - 1];

        githubIssues[severity(issue)].push({
          id: issueNumber,
          title: issue.title
        });

        issueCount += 1;
        if (issueCount != issues.length) {
          return;
        }
        return cb();
      });
    });
  });
  req.end();

  req.on('error', function (e) {
    console.error(e);
  });
}

exports.print = function () {
  fetchIssues(function () {
    for (category in githubIssues) {
      if (!githubIssues.hasOwnProperty(category) || githubIssues[category].length < 1) {
        continue;
      }

      var s = '';
      for (var i=0; i < category; i+=1) {
        s += '★';
      }
      process.stdout.write(s + "\n");

      githubIssues[category].forEach(function (issue) {
        process.stdout.write("  " + issue.id + ": " + issue.title + "\n");
      });
    }
  });
};
