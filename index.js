const
hapi = require('hapi'),
https = require('https'),
convict = require('convict');

const
asana = require('./lib/asana.js'),
bugzilla = require('./lib/bugzilla.js'),
github = require('./lib/github.js'),
teamstatus = require('./lib/teamstatus.js'),
timezones = require('./lib/timezones.js');

conf = convict({
  asana: asana.config,
  bugzilla: bugzilla.config,
  github: github.config,
  teamstatus: teamstatus.config,
  timezones: timezones.config
}).loadFile(__dirname + '/config.json').validate();


var options = {
  ext: {
    onUnknownRoute: onUnknownRoute
  },
  views: {
    path: __dirname + '/templates'
  }
};

function onUnknownRoute(request) {
  request.raw.res.writeHead(404);
  request.raw.res.write('Not found');
  request.raw.res.end();
  request.reply.close();
}

var server = new hapi.Server('localhost', 8000, options);

var responsesReceived = 0;
const expectedResponses = 5;

function indexReply(request, data) {
  responsesReceived += 1;
  if (responsesReceived != expectedResponses) {
    return;
  }

  request.reply.view('index', {
      title: 'Persona Hacker Dashboard',
      data: data
  }).send();
}

var handler = function (request) {
  responsesReceived = 0;
  var data = {
    asana: undefined,
    bugzilla: undefined,
    github: undefined,
    teamstatus: undefined,
    timezones: undefined
  };

  asana.getItems(function (items) {
    data.asana = items;
    indexReply(request, data);
  });

  bugzilla.getItems(function (items) {
    data.bugzilla = items;
    indexReply(request, data);
  });

  github.getItems(function (items) {
    data.github = items;
    indexReply(request, data);
  });

  teamstatus.getItems(function (items) {
    data.teamstatus = items;
    indexReply(request, data);
  });

  timezones.getItems(function (items) {
    data.timezones = items;
    indexReply(request, data);
  });
};

server.addRoute({ method: 'GET', path: '/', handler: handler });

server.start();
