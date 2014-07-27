var App = App || {};
var _ = _ || {};
var pageData = pageData || {};
var pageTmps = pageTmps || {};
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

var params = App.getParams();
App.currentPage = params.page;

_.each(pageData, function (element, index, array) {
  array[index].tmp = Handlebars.template(pageTmps[index]);
});

var pageObj = _.find(pageData, function (o) {
  return o.name === App.currentPage;
});

var newTemplate = pageObj.tmp();

$('body').prepend(newTemplate);

console.log(pageData);