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

_.each(pagesData, function (element, index, array) {
  console.log(element);
  array[index].tmp = Handlebars.template(pagesTmps[index]);
});

console.log(pagesData);

var pageObj = _.find(pagesData, function (o) {
  return o.name === App.currentPage;
});

var newTemplate = pageObj.tmp();

$('body').prepend(newTemplate);
