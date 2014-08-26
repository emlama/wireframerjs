var cheerio = require('cheerio');
var path = require('path');
var fs = require('fs-extra');
var _ = require('underscore');
var Handlebars = require('handlebars');
var utils = require('./utils');

var chokidar = require('chokidar');
var postal = require('postal');
var walk = require('walk');

var logger = require('tracer').colorConsole({
  format : "{{timestamp}} {{title}}:Reader  >> {{message}}",
  dateformat : "HH:MM:ss.l",
  level:'info'
});

var Reader = function (settings) {
  var reader = this;
  reader.postal = postal;
  reader.settings = settings;
  reader.interval = 1;
  reader.compileNeeded = false;

  reader.sourceDir = reader.settings.site;

  // reader.postal.subscribe({
  //   channel: 'Sites',
  //   topic:   'added',
  //   callback: reader.addSite
  // }).withContext(reader);

  reader.watch();
}

Reader.prototype.watch = function () {
  var reader = this;

  reader.watcher = chokidar.watch(reader.sourceDir, {ignored: /[\/\\]\./, persistent: true});

  reader.watcher.on('add', function(path) {
    // logger.debug('File', path, 'has been added');
    if (path.indexOf(reader.settings.buildLocation) === -1) {
      reader.compileNeeded = true;
    }
  });

  reader.watcher.on('change', function(path, stats) {
    // logger.debug('File', path, 'changed size to', stats.size);
    if (path.indexOf(reader.settings.buildLocation) === -1) {
      reader.compileNeeded = true;
    }
  });

  reader.watcher.on('addDir', function(path) {
    // logger.debug('Dir ', path, ' has been added');
    if (path.indexOf(reader.settings.buildLocation) === -1) {
      reader.compileNeeded = true;
    }
  });

  reader.compileChecker = setInterval(function () {
    reader.checkCompileState();
  }, 1000 * reader.interval);
};

Reader.prototype.unwatch = function () {
  this.watcher.close();
  clearInterval(this.compileChecker);
};

Reader.prototype.checkCompileState = function () {
  if (this.compileNeeded === true) {
    this.compileNeeded = false;
    this.processSiteFiles();
  }
};

Reader.prototype.processHTMLFile = function (file) {
  var reader = this;
  var extname = path.extname(file).toLowerCase();
  logger.info("processing %s", file);

  if (extname !== ".html" && extname !== ".htm") {
    throw new Error('Must be html file');
  }

  var source = fs.readFileSync(file);
  var $ = cheerio.load(source, { decodeEntities: false });

  // gather up layouts
  var cheerioLayouts = $('layout');
  var cheerioPages = $('page');
  var cheerioTmps = $('template');
  var cheerioHeads = $('head');

  var htmlObject = {
    layouts: {
      data: [],
      tmps: []
    },
    pages: {
      data: [],
      tmps: []
    },
    templates: {
      data: [],
      tmps: []
    },
    heads: {
      data: [],
      tmps: []
    }
  }

  /**
   * Reduce this down into a loop/function
   */
  cheerioPages.each(function (i, elem) {
    var p = {};
    var $this = $(this);

    p.name = $this.attr('name');
    p.layout = $this.attr('layout') || null;
    // p.rawHTML = $this.html();
    htmlObject.pages.tmps.push(Handlebars.precompile($this.html()));
    htmlObject.pages.data.push(p);
  });

  cheerioLayouts.each(function (i, elem) {
    var p = {};
    var $this = $(this);

    p.name = $this.attr('name');
    // p.layout = $this.attr('layout') || null;
    // p.rawHTML = $this.html();
    htmlObject.layouts.tmps.push(Handlebars.precompile($this.html()));
    htmlObject.layouts.data.push(p);
  });

  cheerioTmps.each(function (i, elem) {
    var p = {};
    var $this = $(this);

    p.name = $this.attr('name');
    // p.layout = $this.attr('layout') || null;
    // p.rawHTML = $this.html();
    htmlObject.templates.tmps.push(Handlebars.precompile($this.html()));
    htmlObject.templates.data.push(p);
  });

  cheerioHeads.each(function (i, elem) {
    var p = {};
    var $this = $(this);
    var html = $this.html().trim();

    // p.name = $this.attr('name');
    // p.layout = $this.attr('layout') || null;
    // p.rawHTML = $this.html();
    htmlObject.heads.tmps.push($this.html());
    // htmlObject.templates.data.push(p);
  });

  reader.postal.publish({
    channel: 'HTML',
    topic: 'discovered',
    data: htmlObject
  });
};

Reader.prototype.processSiteFiles = function () {
  var reader = this;

  var options = {
    followLinks: false,
    filters: [reader.settings.dest]
  };

  walker = walk.walk(reader.sourceDir, options);
  walker.on("file", function (root, fileStats, next) {
    var file = path.join(root, fileStats.name)
    fs.readFile(file, function () {
      var ext = path.extname(file).toLowerCase();

      if (ext === '.html' || ext === '.htm') {
        reader.processHTMLFile(file);
      } else if (fileStats.name === 'config.json') {
        next();
      } else {
        reader.postal.publish({
          channel: 'DOC',
          topic: 'discovered',
          data: file
        });
      }
      next();
    });
  });

  walker.on("end", function () {
    reader.postal.publish({
      channel: 'HTML',
      topic: 'done'
    });
  });

};

module.exports = Reader;
