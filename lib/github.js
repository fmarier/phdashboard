// Github: http://developer.github.com/v3/

const https = require('https');

exports.config =  {
  username: {
    doc: "Github username",
    format: 'string'
  }
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

exports.getItems = function (cb) {
  var issueCount = 0;
  var sortedIssues = {
    sev0: [],
    sev1: [],
    sev2: [],
    sev3: [],
    sev4: [],
    sev5: []
  };

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
      var issues = JSON.parse(issueData);
      issues.forEach(function (issue) {
        var parts = issue.url.split('/');
        var issueNumber = parts[parts.length - 1];

        sortedIssues["sev" + severity(issue)].push({
          id: issueNumber,
          title: issue.title
        });

        issueCount += 1;
        if (issueCount != issues.length) {
          return;
        }
        return cb(sortedIssues);
      });
    });
  });
  req.end();

  req.on('error', function (e) {
    console.error(e);
  });
};

exports.print = function () {
  exports.getItems(function (items) {
    process.stdout.write("GITHUB ISSUES\n");
    for (category in items) {
      if (!items.hasOwnProperty(category) || items[category].length < 1) {
        continue;
      }

      var s = '';
      for (var i=0; i < category; i+=1) {
        s += '★';
      }
      process.stdout.write(s + "\n");

      items[category].forEach(function (issue) {
        process.stdout.write("  " + issue.id + ": " + issue.title + "\n");
      });
    }
  });
};
