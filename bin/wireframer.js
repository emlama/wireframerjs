// through2 is a thin wrapper around node transform streams
var through = require('through2');
var gutil = require('gulp-util');
var cheerio = require('cheerio');
var Handlebars = require('handlebars');
var PluginError = gutil.PluginError;

// consts
const PLUGIN_NAME = 'gulp-wireframer';

function prefixStream(prefixText) {
  var stream = through();
  stream.write(prefixText);
  return stream;
}

function appendTemplates(templateArray, objArr, type) {

  var data = 'var ' + type + 'Tmps = [';

  templateArray.forEach(function(element, index, array) {
    data += '{"tmp":' + element + ',' + '"data":' + JSON.stringify(objArr[index]) + '}';
    if (array.length - 1 !== index) {
      data += ', ';
    }
  });

  data += '];\n';

  return data;
}

// plugin level function (dealing with files)
function gulpWireframer() {
  // if (!prefixText) {
  //   throw new PluginError(PLUGIN_NAME, 'Missing prefix text!');
  // }

  // prefixText = new Buffer(prefixText); // allocate ahead of time

  // creating a stream through which each file will pass
  var stream = through.obj(function(file, enc, cb) {
    if (file.isNull()) {
       // do nothing if no contents
    }

    if (file.isBuffer()) {
      // file.contents = Buffer.concat([prefixText, file.contents]);
      var chunks = String(file.contents);
      var $ = cheerio.load(chunks, { decodeEntities: false });

      // Partion out what we want
      var foundObjs = {
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
      for (var key in foundObjs) {
        foundObjs[key].each(function (i, elem) {
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

      var newChunks = "";

      for (var key in htmlObject) {
        if (key === 'heads') {
          // newChunks += htmlObject[key].tmps.join(" ");
          // Handle elsewhere
        } else {
          newChunks += appendTemplates(htmlObject[key].tmps, htmlObject[key].data, key);
        }
      }

      file.contents = new Buffer(newChunks);
    }

    // if (file.isStream()) {
    //     // file.contents = file.contents.pipe(prefixStream(prefixText));
    //     console.log('is stream');
    // }

    this.push(file);

    return cb();
  });

  // returning the file stream
  return stream;
};

// exporting the plugin main function
module.exports = gulpWireframer;