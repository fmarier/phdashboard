const
hapi = require('hapi'),
https = require('https'),
convict = require('convict');

const
asana = require('./lib/asana.js'),
bugzilla = require('./lib/bugzilla.js'),
github = require('./lib/github.js'),
teamstatus = require('./lib/teamstatus.js');

conf = convict({
  asana: asana.config,
  bugzilla: bugzilla.config,
  github: github.config,
  teamstatus: teamstatus.config
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

function indexReply(request, data) {
  request.reply.view('index', {
      title: 'Persona Hacker Dashboard',
      data: data
  }).send();
}

var handler = function (request) {
  var responsesReceived = 0;
  const expectedResponses = 4;

  var asanaTasks;
  var bugzillaBugs;
  var githubIssues;
  var teamstatusUpdates;

  asana.getItems(function (items) {
    asanaTasks = items;
    responsesReceived += 1;
    if (responsesReceived != expectedResponses) {
      return;
    }
    indexReply(request, {asana: asanaTasks, bugzilla: bugzillaBugs, github: githubIssues, teamstatus: teamstatusUpdates});
  });

  bugzilla.getItems(function (items) {
    bugzillaBugs = items;
    responsesReceived += 1;
    if (responsesReceived != expectedResponses) {
      return;
    }
    indexReply(request, {asana: asanaTasks, bugzilla: bugzillaBugs, github: githubIssues, teamstatus: teamstatusUpdates});
  });

  github.getItems(function (items) {
    githubIssues = items;
    responsesReceived += 1;
    if (responsesReceived != expectedResponses) {
      return;
    }
    indexReply(request, {asana: asanaTasks, bugzilla: bugzillaBugs, github: githubIssues, teamstatus: teamstatusUpdates});
  });

  teamstatus.getItems(function (items) {
    teamstatusUpdates = items;
    responsesReceived += 1;
    if (responsesReceived != expectedResponses) {
      return;
    }
    indexReply(request, {asana: asanaTasks, bugzilla: bugzillaBugs, github: githubIssues, teamstatus: teamstatusUpdates});
  });
};

server.addRoute({ method: 'GET', path: '/', handler: handler });

server.start();
