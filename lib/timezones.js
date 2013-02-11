const
libravatar = require('libravatar'),
timezone = require('timezone');

exports.config = {
  colleagues: {
    doc: "List of \"email address|timezone\", separated by commas.",
    format: 'string'
  }
};

function remoteTime(time, region) {
  var timeString = timezone(time, region, require("timezone/" + region), "%H:%M");
  var remoteDate = timezone(time, region, require("timezone/" + region), "%Y-%m-%d");
  var localDate = timezone(time, "%Y-%m-%d");
  if (localDate != remoteDate) {
    var day = timezone(time, region, require("timezone/" + region), "%A");
    timeString += ' (' + day + ')';
  }
  return timeString;
}

exports.getItems = function (cb) {
  var entries = [];

  var now = new Date();

  var colleagues = conf.get('timezones').colleagues.split(',');
  var colleaguesProcessed = 0;
  colleagues.forEach(function (colleague) {
    var email = colleague.split('|')[0];
    var tz = colleague.split('|')[1];

    libravatar.url({email: email}, function (error, avatar_url) {
      colleaguesProcessed += 1;
      if (!error) {
        entries.push({avatar: avatar_url, time: remoteTime(now, tz)});
        // TODO: keep entries in order of timezone (probably NZ first, London last)
      }
      if (colleaguesProcessed != colleagues.length) {
        return;
      }
      cb(entries);
    });
  });
};
