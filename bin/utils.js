var fs = require('fs-extra');
var _ = require('underscore');
var path = require('path');
var logger = require('tracer').colorConsole({
  format : "{{timestamp}} <{{title}}> {{message}}",
  dateformat : "HH:MM:ss.l",
  level:'info'
});

exports.getConfigFileOptions = function (targetDir) {
  var configFilePath = path.join(targetDir, 'config.json'),
      configFile,
      options;

  try {
    configFile = fs.readFileSync(configFilePath);
    return JSON.parse(configFile);
  } catch (err) {
    logger.error('Cannot run this program without a config file');
    process.exit(1);
  }
}