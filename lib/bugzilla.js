// Bugzilla: https://wiki.mozilla.org/Bugzilla:REST_API (and https://github.com/harthur/bz.js?)

const https = require('https');

exports.config = {
  email: {
    doc: "Bugzilla email",
    format: 'string'
  }
};

var bugzillaBugs = {
  blocker: [],
  critical: [],
  major: [],
  normal: [],
  minor: [],
  trivial: [],
  enhancement: []
};

function fetchBugs(cb) {
  // TODO: fetch private bugs too
  var bugCount = 0;

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
      process.stdout.write("BUGZILLA BUGS\n");

      var bugs = JSON.parse(bugData).bugs;
      bugs.forEach(function (bug) {
        bugzillaBugs[bug.severity].push({id: bug.id, summary: bug.summary, status: bug.status});
        bugCount += 1;
        if (bugCount != bugs.length) {
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
  fetchBugs(function () {
    for (severity in bugzillaBugs) {
      if (!bugzillaBugs.hasOwnProperty(severity) || bugzillaBugs[severity].length < 1) {
        continue;
      }

      process.stdout.write(severity + "\n");

      bugzillaBugs[severity].forEach(function (bug) {
        process.stdout.write("  " + bug.id + ": " + bug.summary + "\n");
      });
    }
  });
};
