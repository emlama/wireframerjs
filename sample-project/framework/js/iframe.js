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

App.renderPage = function (pageName) {
};

$(function() {

  // Update all of dis!
  _.each(templatesTmps, function (element, index, array) {
    array[index].template = Handlebars.template(array[index].tmp);
    Handlebars.registerPartial(element.data.name, Handlebars.template(array[index].tmp));
  });

  _.each(pagesTmps, function (element, index, array) {
    array[index].template = Handlebars.template(array[index].tmp);
    // Handlebars.registerPartial(element.name, Handlebars.template(pagesTmps[index]));
  });

  _.each(layoutsTmps, function (element, index, array) {
    array[index].template = Handlebars.template(array[index].tmp);
  });
  // end init

  App.currentPage = App.getParams().page;
  console.log("current page is " + App.currentPage);

  // If no argument is passed, render the current page.
  var pageName = pageName || this.currentPage;

  // render page
  var pageObj = _.find(pagesTmps, function (o) {
    return o.data.name === App.currentPage;
  });

  if (pageObj.data.layout && pageObj.data.layout !== null) {
    // Overwrite Yield partial with our page
    Handlebars.registerPartial('yield', pageObj.template());

    // Find our layout
    var layoutObj = _.find(layoutsTmps, function (o) {
      return o.data.name === pageObj.data.layout;
    });

    pageObj = layoutObj;
  }

  var newTemplate = pageObj.template();

  // BOOM all there is and ever was
  $('body').html(newTemplate);
  // end render

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
