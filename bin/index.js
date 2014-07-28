#!/usr/bin/env node

var path = require('path');
var _ = require('underscore');
var postal = require('postal');
var fs = require('fs-extra');
var logger = require('tracer').colorConsole({
  format : "{{timestamp}} {{title}}:App     >> {{message}}",
  dateformat : "HH:MM:ss.l",
  level:'info'
});

var Builder = require('./builder');
var Server = require('./server');
var Reader = require('./reader');
var utils = require('./utils');

var App = {};

App.settings = {
  buildLocation: path.join(process.cwd(), '/_site'),
  site: process.cwd(),
  livereload: true,
  launchonload: true
};

App.settings.binPath = path.dirname(
    fs.realpathSync(process.argv.slice(1)[0], function (err, linkpath) {
      return linkpath;
    }));

logger.info("Bin location is %s", App.settings.binPath);
logger.info("Build location is %s", App.settings.buildLocation);

App.settings = _.defaults(utils.getConfigFileOptions(App.settings.site), App.settings);

App.files = {
  htmlFiles: [],
  jsFiles: [],
  cssFiles: [],
  otherFiles: []
};

var builder = new Builder(postal, App.settings);
var reader = new Reader(postal, App.settings);
var server = new Server(postal, App.settings);

server.startServer();
