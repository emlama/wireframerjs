var App = App || {};
var _ = _ || {};
// var pageData = pagesData || {};
// var pageTmps = pagesTmps || {};
var Handlebars = Handlebars || {};

App.getParams = function () {
  'use strict';
  var match,
      pl     = /\+/g,  // Regex for replacing addition symbol with a space
      search = /([^&=]+)=?([^&]*)/g,
      decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
      query  = window.location.search.substring(1);

  var urlParams = {};
  while (match = search.exec(query)) {
    urlParams[decode(match[1])] = decode(match[2]);
  }

  return urlParams;
};

App.currentPage = App.getParams().page;

_.each(templatesData, function (element, index, array) {
  array[index].tmp = Handlebars.template(templatesTmps[index]);
  Handlebars.registerPartial(element.name, Handlebars.template(templatesTmps[index]));
});

_.each(pagesData, function (element, index, array) {
  array[index].tmp = Handlebars.template(pagesTmps[index]);
  Handlebars.registerPartial(element.name, Handlebars.template(pagesTmps[index]));
});

_.each(layoutsData, function (element, index, array) {
  array[index].tmp = Handlebars.template(layoutsTmps[index]);
});

var pageObj = _.find(pagesData, function (o) {
  return o.name === App.currentPage;
});

if (pageObj.layout !== undefined && pageObj.layout !== undefined) {
  Handlebars.registerPartial('yield', Handlebars.template(pagesTmps[0]));
  pageObj = layoutsData[0].tmp();
}

var newTemplate = pageObj;

$('body').prepend(newTemplate);
