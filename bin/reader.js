var cheerio = require('cheerio');
var path = require('path');
var fs = require('fs-extra');
var Handlebars = require('handlebars');
var chokidar = require('chokidar');
var postal = require('postal');
var walk = require('walk');
// var _ = require('underscore');
// var utils = require('./utils');

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

  reader.watch();
};

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

  // Partion out what we want
  var objs = {
    layouts: $('layout'),
    pages: $('page'),
    templates: $('template'),
    heads: $('head')
  };

  // Setup datastore
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
      tmps: []
    }
  };

  // Map data in
  for (var key in objs) {
    objs[key].each(function (i, elem) {
      var p = {};
      var $this = $(this);

      p.name = $this.attr('name');

      if (key === 'pages') {
        p.layout = $this.attr('layout') || null;
      }

      if (key !== 'heads') {
        htmlObject[key].data.push(p);
        // Templates are recompiled at this point
        htmlObject[key].tmps.push(Handlebars.precompile( $this.html() ));
      } else {
        htmlObject[key].tmps.push( $this.html().trim()  );
      }
    });
  }

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
    var file = path.join(root, fileStats.name);
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
