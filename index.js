#!/usr/bin/node

const
https = require('https'),
convict = require('convict');

const
asana = require('./lib/asana.js'),
github = require('./lib/github.js'),
bugzilla = require('./lib/bugzilla.js');

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
  github: {
    username: {
      doc: "Github username",
      format: 'string'
    }
  },
  bugzilla: {
    email: {
      doc: "Bugzilla email",
      format: 'string'
    }
  }
}).loadFile(__dirname + '/config.json').validate();

// TODO: check https certs

asana.print();
github.print();
bugzilla.print();
