var Handlebars = require('handlebars');
var logger = require('tracer').colorConsole({
  format : "{{timestamp}} <{{title}}> [Mapper] {{message}}",
  dateformat : "HH:MM:ss.l",
  level:'info'
});
var fs = require('fs');
var cheerio = require('cheerio');

var source = fs.readFileSync('../sample/index.html');
var $ = cheerio.load(source, { decodeEntities: false });

// gather up layouts
var cheerioLayouts = $('layout');
var pages = $('page');
var tmps = $('template');

var layouts = [];
var layoutsTemplates = [];

cheerioLayouts.each(function (i, elem) {
  var l = {};

  l.name = $(this).attr('name');
  l.rawHTML = $(this).html();
  layoutsTemplates.push("var lay" + l.name + " = " + Handlebars.precompile(l.rawHTML) + ";\n");
  layouts.push(l);
});

logger.info(layouts);
fs.appendFileSync('../sample/compiledTemplates.js', "var layouts = " + JSON.stringify(layouts) + ";\n");
fs.appendFileSync('../sample/compiledTemplates.js', layoutsTemplates[0]);