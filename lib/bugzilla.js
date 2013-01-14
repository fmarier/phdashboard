// Bugzilla: https://wiki.mozilla.org/Bugzilla:REST_API (and https://github.com/harthur/bz.js?)

const https = require('https');

exports.config = {
  email: {
    doc: "Bugzilla email",
    format: 'string'
  }
};

exports.getItems = function (cb) {
  // TODO: fetch private bugs too
  var bugCount = 0;
  var sortedBugs = {
    blocker: [],
    critical: [],
    major: [],
    normal: [],
    minor: [],
    trivial: [],
    enhancement: []
  };

  var options = {
    hostname: 'api-dev.bugzilla.mozilla.org',
    port: 443,
    path: '/1.1/bug?email1=' + conf.get('bugzilla').email + '&email1_type=equals_any&email1_assigned_to=1&email1_qa_contact=1&email1_cc=1&status=UNCONFIRMED&status=NEW&status=ASSIGNED&status=REOPENED&include_fields=id,summary,severity,status',
    method: 'GET'
  };
  var req = https.request(options, function (res) {
    var bugData = '';
    res.on('data', function (chunk) {
      bugData += chunk;
    });

    res.on('end', function () {
      var bugs = JSON.parse(bugData).bugs;
      bugs.forEach(function (bug) {
        sortedBugs[bug.severity].push({id: bug.id, summary: bug.summary, status: bug.status});
        bugCount += 1;
        if (bugCount != bugs.length) {
          return;
        }
        return cb(sortedBugs);
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
    process.stdout.write("BUGZILLA BUGS\n");

    for (severity in items) {
      if (!items.hasOwnProperty(severity) || items[severity].length < 1) {
        continue;
      }

      process.stdout.write(severity + "\n");

      items[severity].forEach(function (bug) {
        process.stdout.write("  " + bug.id + ": " + bug.summary + "\n");
      });
    }
  });
};
