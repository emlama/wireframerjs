var fs = require('fs-extra');
var path = require('path');
var logger = require('tracer').colorConsole({
  format : "{{timestamp}} {{title}}:Builder >> {{message}}",
  dateformat : "HH:MM:ss.l",
  level:'info'
});

var Builder = function (postal, settings) {
  var builder = this;
  builder.postal = postal;
  builder.settings = settings;
  builder.htmlFiles = [];

  builder.postal.subscribe({
    channel: 'HTML',
    topic:   'discovered',
    callback: builder.captureFile
  }).withContext(builder);

  builder.postal.subscribe({
    channel: 'HTML',
    topic:   'done',
    callback: builder.compileSite
  }).withContext(builder);

};

Builder.prototype.captureFile = function (data) {
  this.htmlFiles.push(data);
  logger.info('Data pushed into html files');
};

Builder.prototype.compileSite = function () {
  logger.info('Compiling site');
  var builder = this;
  var buildLoc = builder.settings.buildLocation;
  var binDir = builder.settings.binPath;

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

  fs.copy(binDir + '/client/js', jsPath);
  fs.copy(binDir + '/client/stylesheets', cssPath);
  fs.copy(binDir + '/client/bower_components', bowerPath);
  fs.copy(binDir + '/client/html/index.html', buildLoc + '/index.html');
  fs.copy(binDir + '/client/html/iframe.html', buildLoc + '/iframe.html');

  builder.htmlFiles.forEach(function (element, index, array) {
    var keys = Object.keys(element);
    for (key in element) {
      builder.appendTemplates(element[key].tmps, buildLoc, key);
      builder.appendObject(element[key].data, buildLoc, key);
    }
    // logger.info(keys);
  });
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
