(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['test-template'] = template({"compiler":[5,">= 2.0.0"],"main":function(depth0,helpers,partials,data) {
  return "<nav>\n  <h1>Prototype</h1>\n  <ul>\n    <li><a href=\"\">Home</a></li>\n    <li><a href=\"\">About</a></li>\n    <li><a href=\"\">Contact</a></li>\n    <li><a href=\"\">Foobar</a></li>\n    <li><a href=\"\">Settings</a></li>\n  </ul>\n</nav>";
  },"useData":true});
})();