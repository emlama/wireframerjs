#!/usr/bin/env node

var path = require('path');
var _ = require('underscore');
var postal = require('postal');
var fs = require('fs-extra');

var Builder = require('./builder');
var Server = require('./server');
var Reader = require('./reader');
var utils = require('./utils');

var App = {};

App.settings = {
  dest: "_site",
  site: process.cwd(),
  livereload: true,
  launchonload: true,
  logLevel: 'debug',
  port: 3000,
  server: true
};

var logger = require('tracer').colorConsole({
  format : "{{timestamp}} {{title}}:App     >> {{message}}",
  dateformat : "HH:MM:ss.l",
  level: App.settings.logLevel
});

App.settings.binPath = path.dirname(
    fs.realpathSync(process.argv.slice(1)[0], function (err, linkpath) {
      return linkpath;
    }));

// Finally apply settings that have been gathered
App.settings = _.defaults(utils.getConfigFileOptions(App.settings.site), App.settings);
App.settings.buildLocation = path.join(App.settings.site, App.settings.dest)

logger.info("Looking for files in %s and sending them to %s", App.settings.binPath, App.settings.buildLocation);

var builder = new Builder(App.settings);
var reader = new Reader(App.settings);
var server = new Server(App.settings);

if (App.settings.server === true) {
  server.startServer();
}