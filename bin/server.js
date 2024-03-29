var livereload = require('livereload');
// var postal = require('postal');
var staticServer = require('node-static');
var opener = require('open');
var logger = require('tracer').colorConsole({
  format : "{{timestamp}} {{title}}:Server  >> {{message}}",
  dateformat : "HH:MM:ss.l",
  level:'info'
});

var Server = function (settings) {
  var server = this;

  // server.postal = postal;
  server.settings = settings;
};

Server.prototype.startServer = function () {
  var server = this;

  if (server.settings.livereload === true) {
    server.startLivereload(server.settings.buildLocation);
    logger.info('Live reload initialized for %s', server.settings.buildLocation);
  }

  server.runServer(server.settings.buildLocation);
};

Server.prototype.startLivereload = function (watchpath) {
  this.livereload = livereload.createServer();
  this.livereload.watch(watchpath);
};

Server.prototype.runServer = function (path) {
  var simpleServer = new staticServer.Server(path, { cache: false });

  require('http').createServer(function (request, response) {
    request.addListener('end', function () {
      simpleServer.serve(request, response, function (e, res) {
        if (e && (e.status === 404)) {
          simpleServer.serveFile('/index.html', 200, {}, request, response);
        }
      });
    }).resume();
  }).listen(this.settings.port);

  if (this.settings.launchonload === true) {
    opener('http://localhost:' + this.settings.port +'/');
  }
};

module.exports = Server;