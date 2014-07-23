var Handlebars = require('handlebars');
var logger = require('tracer').colorConsole({
  format : "{{timestamp}} <{{title}}> {{message}}",
  dateformat : "HH:MM:ss.l",
  level:'info'
});
var fs = require('fs');
var cheerio = require('cheerio');

var source = fs.readFileSync('../sample/sample-template-files.html');
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

var buildLocation = '../sample/compiledTemplates.js';

cheerioPages.each(function (i, elem) {
  var p = {};
  var $this = $(this);

  p.name = $this.attr('name');
  p.layout = $this.attr('layout') || null;
  // p.rawHTML = $this.html();
  pagesTemplates.push(Handlebars.precompile($this.html()));
  pages.push(p);
});

appendTemplates(pagesTemplates, buildLocation, 'page');
appendObject(pages, buildLocation, 'page');

function appendTemplates (tmpArr, path, type) {

  try {
    fs.appendFileSync(path, "var " + type + "Tmps = [");

    tmpArr.forEach(function(element, index, array) {
      fs.appendFileSync(path, element);
      if (array.length - 1 !== index) {
        fs.appendFileSync(path, ", ");
      }
    });

    fs.appendFileSync(path, "];\n");
    return true;
  } catch (e) {
    logger.error(e);
    return false;
  }
}

function appendObject (objArr, path, type) {
  fs.appendFileSync(path, "var " + type + "Data = " + JSON.stringify(objArr) + ";\n");
}