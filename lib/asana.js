// Asana: http://developer.asana.com/documentation/

const https = require('https');

exports.config = {
  apiKey: {
    doc: "API key",
    format: 'string'
  },
  workspaces: {
    doc: "List of workspace IDs to use, separated by commas.",
    format: 'string'
  }
};

const ASANA_API_URL = 'app.asana.com';
const ASANA_API_PATH = '/api/1.0/';

var asanaTasks = {
  inbox: [],
  later: [],
  today: [],
  upcoming: []
};
var workspaceCount = 0;

function fetchAsanaTask(taskId, cb) {
  var options = {
    hostname: ASANA_API_URL,
    port: 443,
    path: ASANA_API_PATH + 'tasks/' + taskId,
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
      var task = JSON.parse(taskData).data;
      if (!task.completed) {
        asanaTasks[task.assignee_status].push({id: task.id, title: task.name});
      }
      return cb();
    });
  });
  req.end();

  req.on('error', function (e) {
    console.error(e);
  });
}

function fetchAsanaWorkspace(workspace, cb) {
  var taskCount = 0;

  var options = {
    hostname: ASANA_API_URL,
    port: 443,
    path: ASANA_API_PATH + 'tasks?workspace=' + workspace + '&assignee=me',
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
      if (tasks.length < 1) {
        workspaceCount += 1;
        return cb();
      }

      tasks.forEach(function (task) {
        fetchAsanaTask(task.id, function () {
          taskCount += 1;
          if (taskCount === tasks.length) {
            workspaceCount += 1;
          }
          return cb();
        });
      });
    });
  });
  req.end();

  req.on('error', function (e) {
    console.error(e);
  });
}

exports.getItems = function (cb) {
  var workspaces = conf.get('asana').workspaces.split(',');
  workspaces.forEach(function (workspace) {
    fetchAsanaWorkspace(workspace, function () {
      if (workspaces.length != workspaceCount) {
        return;
      }

      cb(asanaTasks);
    });
  });
};

exports.print = function () {
  exports.getItems(function (items){
    process.stdout.write("ASANA TASKS\n");
    for (status in items) {
      if (!items.hasOwnProperty(status) || items[status].length < 1) {
        continue;
      }

      process.stdout.write(status + "\n");
      items[status].forEach(function (task) {
        process.stdout.write("  " + task.id + ": " + task.name + "\n");
      });
    }
  });
};
