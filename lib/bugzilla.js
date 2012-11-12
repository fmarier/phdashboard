// Bugzilla: https://wiki.mozilla.org/Bugzilla:REST_API (and https://github.com/harthur/bz.js?)

const https = require('https');

exports.config = {
  email: {
    doc: "Bugzilla email",
    format: 'string'
  }
};

exports.print = function () {
  // TODO: fetch private bugs too
  var options = {
    hostname: 'api-dev.bugzilla.mozilla.org',
    port: 443,
    path: '/1.1/bug?email1=' + conf.get('bugzilla').email + '&email1_type=equals_any&email1_assigned_to=1&email1_qa_contact=1&email1_cc=1&status=UNCONFIRMED&status=NEW&status=ASSIGNED&status=REOPENED&include_fields=id,summary',
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
        var bugID = bug.id;
        var bugSummary = bug.summary;
        process.stdout.write("  " + bugID + ": " + bugSummary + "\n");
      });
    });
  });
  req.end();

  req.on('error', function (e) {
    console.error(e);
  });
};
