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

$(function() {
  // we get a normal Location object

  /*
   * Note, this is the only difference when using this library,
   * because the object document.location cannot be overriden,
   * so library the returns generated "location" object within
   * an object window.history, so get it out of "history.location".
   * For browsers supporting "history.pushState" get generated
   * object "location" with the usual "document.location".
   */
  var location = window.history.location || window.location;

  // looking for all the links and hang on the event, all references in this document
  $(document).on('click', 'a', function() {
    // keep the link in the browser history
    history.pushState(null, null, this.href);

    console.log(this.href);
    // here can cause data loading, etc.

    // do not give a default action
    return false;
  });

  // hang on popstate event triggered by pressing back/forward in browser
  $(window).on('popstate', function(e) {

    // console.log(this.href);
    // here can cause data loading, etc.

    // just post
    alert("We returned to the page with a link: " + location.href);
  });
  });
