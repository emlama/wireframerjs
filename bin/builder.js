var fs = require('fs-extra');
var path = require('path');
var Handlebars = require('handlebars');
var postal = require('postal');
var logger = require('tracer').colorConsole({
  format : "{{timestamp}} {{title}}:Builder >> {{message}}",
  dateformat : "HH:MM:ss.l",
  level:'info'
});

var Builder = function (settings) {
  var builder = this;
  builder.postal = postal;
  builder.settings = settings;
  builder.htmlFiles = [];
  builder.documents = [];

  builder.postal.subscribe({
    channel: 'HTML',
    topic:   'discovered',
    callback: builder.captureHTMLFile
  }).withContext(builder);

  builder.postal.subscribe({
    channel: 'HTML',
    topic:   'done',
    callback: builder.compileSite
  }).withContext(builder);

  builder.postal.subscribe({
    channel: 'DOC',
    topic:   'discovered',
    callback: builder.captureDoc
  }).withContext(builder);

};

Builder.prototype.compileSite = function () {
  logger.info('Compiling site...');
  var builder     = this;
  var buildLoc    = builder.settings.buildLocation;
  var binDir      = builder.settings.binPath;
  var iframeHead  = '';

  /**
   * Right now I'm just wiping the old directory away
   * I think I should consider putting it into a cache
   * location trying to do the build and rolling back
   * if I'm not successful.
   */
  fs.removeSync(buildLoc);

  var buildPaths = {
    jsPath: '/js',
    cssPath: '/stylesheets',
    bowerPath: '/bower_components'
  };

  for (var key in buildPaths) {
    fs.ensureDirSync( path.join(buildLoc, buildPaths[key]) );
  }

  builder.htmlFiles.forEach(function (element, index, array) {
    for (var key in element) {
      if (key === 'heads') {
        iframeHead = element[key].tmps.join(" ");
      } else {
        builder.appendTemplates(element[key].tmps, element[key].data, buildLoc, key);
      }
    }
  });

  builder.htmlFiles = []; // Reset html files to nothing

  builder.documents.forEach(function (element, index, array) {
    var basePath = element.replace(builder.settings.site, '');
    var target = path.join(buildLoc, basePath);
    fs.copySync(element, target);
  });

  builder.documents = []; // Reset html files to nothing

  Handlebars.registerPartial('head', iframeHead);
  var rawIframe = fs.readFileSync(binDir + '/client/html/iframe.handlebars', 'utf8');
  var iframe = Handlebars.compile(rawIframe);
  console.log(iframeHead);
  fs.writeFileSync(buildLoc + '/iframe.html', iframe());

  for (var k in buildPaths) {
    fs.copySync(
        path.join(binDir, '/client/', buildPaths[k]),
        path.join(buildLoc, buildPaths[k])
      );
  }

  fs.copySync(
      path.join(binDir, '/client/html/index.html'),
      path.join(buildLoc, '/index.html')
    );
};

Builder.prototype.appendTemplates = function (templateArray, objArr, dir, type) {
  var newFilePath = path.join(dir, 'js', type + '.js');
  try {
    fs.appendFileSync(newFilePath, 'var ' + type + 'Tmps = [');

    templateArray.forEach(function(element, index, array) {
      fs.appendFileSync(newFilePath,
          '{"tmp":' +
          element +
          ',' +
          '"data":' +
          JSON.stringify(objArr[index]) +
          '}'
        );
      if (array.length - 1 !== index) {
        fs.appendFileSync(newFilePath, ', ');
      }
    });

    fs.appendFileSync(newFilePath, '];\n');

    return true;
  } catch (err) {
    logger.error(err);
    return false;
  }
};

// Used to capture notices from reader.js
Builder.prototype.captureHTMLFile = function (data) {
  this.htmlFiles.push(data);
  logger.debug('Data pushed into html files');
};

Builder.prototype.captureDoc = function (data) {
  this.documents.push(data);
  logger.debug('Data pushed into documents');
};

module.exports = Builder;
