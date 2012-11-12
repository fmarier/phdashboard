#!/usr/bin/node

const
https = require('https'),
convict = require('convict');

const
asana = require('./lib/asana.js'),
bugzilla = require('./lib/bugzilla.js'),
github = require('./lib/github.js'),
teamstatus = require('./lib/teamstatus.js');

conf = convict({
  asana: {
    apiKey: {
      doc: "API key",
      format: 'string'
    },
    workspaces: {
      doc: "List of workspace IDs to use, separated by commas.",
      format: 'string'
    }
  },
  bugzilla: {
    email: {
      doc: "Bugzilla email",
      format: 'string'
    }
  },
  github: {
    username: {
      doc: "Github username",
      format: 'string'
    }
  },
  teamstatus: {
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
  }
}).loadFile(__dirname + '/config.json').validate();

// TODO: check https certs

asana.print();
github.print();
bugzilla.print();
teamstatus.print();
