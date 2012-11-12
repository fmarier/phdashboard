// http://teamstat.us/#show/<server>/<channel>/<nick>
// http://teamstat.us/api/updates/<server>/<channel>/<nick>

const http = require('http');

exports.print = function () {
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
      process.stdout.write("TEAMSTATUS UPDATES\n");
  
      var updates = JSON.parse(updateData).items;
      updates.forEach(function (update) {
        var updateLabel = update.label;
        process.stdout.write("  " + updateLabel + "\n");
      });
    });
  });
  req.end();

  req.on('error', function (e) {
    console.error(e);
  });
};
