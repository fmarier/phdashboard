#!/usr/bin/node

var https = require('https');

var ASANA_API_KEY = '';
var ASANA_WORKSPACE_IDS = ['', ''];

var GITHUB_USERNAME = 'fmarier';

var BUGZILLA_EMAIL = 'francois@mozilla.com';

// TODO: check https certs

// Asana: http://developer.asana.com/documentation/
function fetchAsana() {
  // TODO: query all Asana workspaces
  var options = {
    hostname: 'app.asana.com',
    port: 443,
    path: '/api/1.0/tasks?workspace=' + ASANA_WORKSPACE_IDS[0] + '&assignee=me',
    auth: ASANA_API_KEY + ':',
    headers: {'Content-Type': 'application/json'},
    method: 'GET'
  };
  var req = https.request(options, function (res) {
    var taskData = '';
    res.on('data', function (chunk) {
      taskData += chunk;
    });

    res.on('end', function () {
      process.stdout.write("ASANA TASKS\n");
  
      var tasks = JSON.parse(taskData).data;
      tasks.forEach(function (task) {
        var taskID = task.id;
        var taskName = task.name;
        process.stdout.write("  " + taskID + ": " + taskName + "\n");
      });
    });
  });
  req.end();

  req.on('error', function (e) {
    console.error(e);
  });
}

// Github: http://developer.github.com/v3/
function fetchGithub() {
  var options = {
    hostname: 'api.github.com',
    port: 443,
    path: '/repos/mozilla/browserid/issues?assignee=' + GITHUB_USERNAME,
    method: 'GET'
  };
  var req = https.request(options, function (res) {
    var issueData = '';
    res.on('data', function (chunk) {
      issueData += chunk;
    });

    res.on('end', function () {
      process.stdout.write("GITHUB ISSUES\n");
  
      var issues = JSON.parse(issueData);
      issues.forEach(function (issue) {
        var issueURL = issue.url;
        var issueTitle = issue.title;
        process.stdout.write("  " + issueURL + ": " + issueTitle + "\n");
      });
    });
  });
  req.end();

  req.on('error', function (e) {
    console.error(e);
  });
}

// Bugzilla: https://wiki.mozilla.org/Bugzilla:REST_API (and https://github.com/harthur/bz.js?)
function fetchBugzilla() {
  // TODO: fetch private bugs too
  var options = {
    hostname: 'api-dev.bugzilla.mozilla.org',
    port: 443,
    path: '/1.1/bug?email1=' + BUGZILLA_EMAIL + '&email1_type=equals_any&email1_assigned_to=1&email1_qa_contact=1&email1_cc=1&status=UNCONFIRMED&status=NEW&status=ASSIGNED&status=REOPENED&include_fields=id,summary',
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
}

//fetchAsana();
fetchGithub();
fetchBugzilla();
