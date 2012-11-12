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
  asana: asana.config,
  bugzilla: bugzilla.config,
  github: github.config,
  teamstatus: teamstatus.config
}).loadFile(__dirname + '/config.json').validate();

// TODO: check https certs

asana.print();
github.print();
bugzilla.print();
teamstatus.print();
