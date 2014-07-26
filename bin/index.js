var Handlebars = require('handlebars');
var logger = require('tracer').colorConsole({
  format : "{{timestamp}} <{{title}}> {{message}}",
  dateformat : "HH:MM:ss.l",
  level:'info'
});
var fs = require('fs-extra');
var cheerio = require('cheerio');
var _ = require('underscore');
var livereload = require('livereload');
var path = require('path');
var static = require('node-static');

var WF = {};

WF.options = {
  buildLocation: '../compiled-site',
  cwd: process.cwd()
};

WF.htmlFiles = [];
WF.jsFiles = [];
WF.cssFiles = [];
WF.otherFiles = [];


setDefaults();
findHTMLFiles();
// runServer();

function processHTMLFile (file) {
  var source = fs.readFileSync(file);
  var $ = cheerio.load(source, { decodeEntities: false });

  // gather up layouts
  var cheerioLayouts = $('layout');
  var cheerioPages = $('page');
  var cheerioTmps = $('template');

  var layouts = [];
  var layoutsTemplates = [];

  var pages = [];
  var pagesTemplates = [];

  var pages = [];
  var pagesTemplates = [];

  cheerioPages.each(function (i, elem) {
    var p = {};
    var $this = $(this);

    p.name = $this.attr('name');
    p.layout = $this.attr('layout') || null;
    // p.rawHTML = $this.html();
    pagesTemplates.push(Handlebars.precompile($this.html()));
    pages.push(p);
  });

  appendTemplates(pagesTemplates, WF.options.buildLocation, 'page');
  appendObject(pages, WF.options.buildLocation, 'page');
}

function walk (start, callback) {
  fs.lstat(start, function (err, stat) {
    if (err) { return callback(err) }
    if (stat.isDirectory()) {

      fs.readdir(start, function (err, files) {
        var coll = files.reduce(function (acc, i) {
          var abspath = path.join(start, i);

          if (fs.statSync(abspath).isDirectory()) {
            walk(abspath, callback);
            acc.dirs.push(abspath);
          } else {
            acc.names.push(abspath);
          }

          return acc;
        }, {"names": [], "dirs": []});

        return callback(null, start, coll.dirs, coll.names);
      });
    } else {
      return callback(new Error("path: " + start + " is not a directory"));
    }
  });
};

function findHTMLFiles () {
  walk(process.cwd(), function (foo, dirPath, dirs, files) {
    _.each(files, function (file) {
      var relative = file.replace(WF.options.cwd, '');
      var ext = path.extname(file).toLowerCase();

      logger.info(ext);
      if (ext === '.html' || ext === '.htm') {
        WF.htmlFiles.push(file);
        processHTMLFile(file);
      } else if (ext === '.js') {
        WF.jsFiles.push(file);
      } else if (relative === 'config.json') {
        // WF.cssFiles.push(file);
      } else {
        WF.otherFiles.push(file)
        var dest = path.join(WF.options.buildLocation, relative);
        fs.copy(file, dest);
      }
    })
  });
}

function setDefaults () {
  var configFile;

  try {
    configFile = fs.readFileSync('../sample-project/config.json');
    WF.options = _.defaults(JSON.parse(configFile), WF.options);
    var dir = path.dirname(process.cwd());
    WF.options.buildLocation = path.normalize(WF.options.buildLocation);
    WF.options.buildLocation = path.join(dir, WF.options.buildLocation);
  } catch (err) {
    // logger.error(err);
    logger.error('Cannot run this program without a config file');
  }
}

function runServer () {
  server = livereload.createServer();
  server.watch(WF.options.buildLocation);
  var file = new static.Server(WF.options.buildLocation);

  require('http').createServer(function (request, response) {
      request.addListener('end', function () {
          file.serve(request, response);
      }).resume();
  }).listen(8080);
}

function appendTemplates (tmpArr, dir, type) {
  var newdir = path.join(dir, type + '.js');
  try {
    fs.appendFile(newdir, "var " + type + "Tmps = [", function (err) {
      if (err) throw err;
      console.log('The "data to append" was appended to file!');
    });

    tmpArr.forEach(function(element, index, array) {
      fs.appendFile(newdir, element, function (err) {
        if (err) throw err;
        console.log('The "data to append" was appended to file!');
      });
      if (array.length - 1 !== index) {
        fs.appendFile(newdir, ", ", function (err) {
          if (err) throw err;
          console.log('The "data to append" was appended to file!');
        });
      }
    });

    fs.appendFile(newdir, "];\n", function (err) {
      if (err) throw err;
      console.log('The "data to append" was appended to file!');
    });
    return true;
  } catch (err) {
    logger.error(err);
    return false;
  }
}

function appendObject (objArr, dir, type) {
  var newdir = path.join(dir, type + '.js');
  fs.appendFile(newdir, "var " + type + "Data = " + JSON.stringify(objArr) + ";\n", function (err) {
    if (err) throw err;
    console.log('The "data to append" was appended to file!');
  });
}