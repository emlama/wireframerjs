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

  builder.postal.subscribe({
    channel: 'HTML',
    topic:   'discovered',
    callback: builder.captureFile
  });

  builder.postal.subscribe({
    channel: 'HTML',
    topic:   'done',
    callback: builder.compileSite
  }).withContext(builder);

};

Builder.prototype.captureFile = function (data) {
  logger.info('caputre file');
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
  fs.copy(binDir + '/client/js', jsPath);
  fs.copy(binDir + '/client/stylesheets', cssPath);
  fs.copy(binDir + '/client/bower_components', bowerPath);
  fs.copy(binDir + '/client/html/index.html', buildLoc + '/index.html');
  fs.copy(binDir + '/client/html/iframe.html', buildLoc + '/iframe.html');

  // appendTemplates(tmpArr, dest, type);
  // appendObject(objArr, dir, type);
};

Builder.prototype.appendTemplates = function (templateArray, dir, type) {
  var newFilePath = path.join(dir, type + '.js');
  try {
    fs.appendFile(newFilePath, "var " + type + "Tmps = [", function (err) {
      if (err) throw err;
      console.log('The "data to append" was appended to file!');
    });

    templateArray.forEach(function(element, index, array) {
      fs.appendFile(newFilePath, element, function (err) {
        if (err) throw err;
        console.log('The "data to append" was appended to file!');
      });
      if (array.length - 1 !== index) {
        fs.appendFile(newFilePath, ", ", function (err) {
          if (err) throw err;
          console.log('The "data to append" was appended to file!');
        });
      }
    });

    fs.appendFile(newFilePath, "];\n", function (err) {
      if (err) throw err;
      console.log('The "data to append" was appended to file!');
    });
    return true;
  } catch (err) {
    logger.error(err);
    return false;
  }
};

Builder.prototype.appendObject = function (objArr, dir, type) {
  var newFilePath = path.join(dir, type + '.js');
  fs.appendFile(newFilePath, "var " + type + "Data = " + JSON.stringify(objArr) + ";\n", function (err) {
    if (err) throw err;
    console.log('The "data to append" was appended to file!');
  });
};

module.exports = Builder;
