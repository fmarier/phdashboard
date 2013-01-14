// http://teamstat.us/#show/<server>/<channel>/<nick>
// http://teamstat.us/api/updates/<server>/<channel>/<nick>

const http = require('http');

exports.config = {
  server: {
    doc: "IRC server",
    format: 'string = "irc.mozilla.org"'
  },
  channel: {
    doc: "IRC channel",
    format: 'string = "identity"'
  },
  nick: {
    doc: "IRC nickname",
    format: 'string'
  }
};

exports.getItems = function (cb) {
  var config = conf.get('teamstatus');

  var options = {
    hostname: 'teamstat.us',
    port: 80,
    path: '/api/updates/' + config.server + '/' + config.channel + '/' + config.nick, 
    method: 'GET'
  };
  var req = http.request(options, function (res) {
    var updateData = '';
    res.on('data', function (chunk) {
      updateData += chunk;
    });

    res.on('end', function () {
      var updates = JSON.parse(updateData).items;
      cb(updates);
    });
  });
  req.end();

  req.on('error', function (e) {
    console.error(e);
  });
};

exports.print = function () {
  exports.getItems(function (items) {
    process.stdout.write("TEAMSTATUS UPDATES\n");

    items.forEach(function (update) {
      var updateLabel = update.content;
      process.stdout.write("  " + updateLabel + "\n");
    });
  });
};
