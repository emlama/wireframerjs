var livereload = require('livereload');
var staticServer = require('node-static');
var opener = require('open');
var logger = require('tracer').colorConsole({
  format : "{{timestamp}} {{title}}:Server  >> {{message}}",
  dateformat : "HH:MM:ss.l",
  level:'info'
});

var Server = function (postal, settings) {
  var server = this;

  server.postal = postal;
  server.settings = settings;

  // server.startServer();
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
  var simpleServer = new staticServer.Server(path);

  require('http').createServer(function (request, response) {
      request.addListener('end', function () {
          simpleServer.serve(request, response);
      }).resume();
  }).listen(8080);

  opener('http://localhost:8080/');
};

module.exports = Server;