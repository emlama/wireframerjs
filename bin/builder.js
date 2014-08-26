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

Builder.prototype.captureHTMLFile = function (data) {
  this.htmlFiles.push(data);
  logger.debug('Data pushed into html files');
};

Builder.prototype.captureDoc = function (data) {
  this.documents.push(data);
  logger.debug('Data pushed into documents');
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

  // TODO refactor into a simple _.each loop
  // TODO catch errors
  var jsPath = path.join(buildLoc, '/js');
  var cssPath = path.join(buildLoc, '/stylesheets');
  var bowerPath = path.join(buildLoc, '/bower_components');

  fs.ensureDirSync(jsPath);
  fs.ensureDirSync(cssPath);
  fs.ensureDirSync(bowerPath);

  builder.htmlFiles.forEach(function (element, index, array) {
    var keys = Object.keys(element);
    for (key in element) {
      if (key === 'heads') {
        iframeHead = element[key].tmps.join("");
      } else {
        builder.appendTemplates(element[key].tmps, buildLoc, key);
        builder.appendObject(element[key].data, buildLoc, key);
      }
    }
    // logger.info(keys);
  });

  // Reset html files to nothing
  builder.htmlFiles = [];

  builder.documents.forEach(function (element, index, array) {
    var basePath = element.replace(builder.settings.site, "");
    var target = path.join(buildLoc, basePath);
    fs.copySync(element, target);
  });

  // Reset html files to nothing
  builder.documents = [];

  Handlebars.registerPartial('head', iframeHead);
  var rawIframe = fs.readFileSync(binDir + '/client/html/iframe.handlebars', 'utf8');
  var iframe = Handlebars.compile(rawIframe);
  fs.writeFileSync(buildLoc + '/iframe.html', iframe());

  fs.copySync(binDir + '/client/js', jsPath);
  fs.copySync(binDir + '/client/stylesheets', cssPath);
  fs.copySync(binDir + '/client/bower_components', bowerPath);
  fs.copySync(binDir + '/client/html/index.html', buildLoc + '/index.html');
  // fs.copy(binDir + '/client/html/iframe.html', buildLoc + '/iframe.html');

};

Builder.prototype.appendTemplates = function (templateArray, dir, type) {
  var newFilePath = path.join(dir, 'js', type + '.js');
  try {
    fs.appendFileSync(newFilePath, "var " + type + "Tmps = [");

    templateArray.forEach(function(element, index, array) {
      fs.appendFileSync(newFilePath, element);
      if (array.length - 1 !== index) {
        fs.appendFileSync(newFilePath, ", ");
      }
    });

    fs.appendFileSync(newFilePath, "];\n");
    return true;
  } catch (err) {
    logger.error(err);
    return false;
  } finally {

  }
};

Builder.prototype.appendObject = function (objArr, dir, type) {
  var newFilePath = path.join(dir, 'js', type + '.js');
  fs.appendFileSync(newFilePath, "var " + type + "Data = " + JSON.stringify(objArr) + ";\n");
};

module.exports = Builder;
