// Asana: http://developer.asana.com/documentation/

const https = require('https');

var asanaTasks = [];
var asanaWorkspaceCount = 0;

function fetchAsanaWorkspace(workspace, cb) {
  var options = {
    hostname: 'app.asana.com',
    port: 443,
    path: '/api/1.0/tasks?workspace=' + workspace + '&assignee=me',
    auth: conf.get('asana').apiKey + ':',
    headers: {'Content-Type': 'application/json'},
    method: 'GET'
  };
  var req = https.request(options, function (res) {
    var taskData = '';
    res.on('data', function (chunk) {
      taskData += chunk;
    });

    res.on('end', function () {
      var tasks = JSON.parse(taskData).data;
      tasks.forEach(function (task) {
        asanaTasks.push({id: task.id, name: task.name});
      });

      asanaWorkspaceCount += 1;
      return cb();
    });
  });
  req.end();

  req.on('error', function (e) {
    console.error(e);
  });
}

exports.print = function () {
  var workspaces = conf.get('asana').workspaces.split(',');
  workspaces.forEach(function (workspace) {
    fetchAsanaWorkspace(workspace, function () {
      if (workspaces.length != asanaWorkspaceCount) {
        return;
      }

      process.stdout.write("ASANA TASKS\n");
        asanaTasks.forEach(function (task) {
        process.stdout.write("  " + task.id + ": " + task.name + "\n");
      });
    });
  });
};
