var layouts = [{"name":"default","rawHTML":"\n  <div id=\"contain\">\n    {{> nav}}\n    <div class=\"content\">\n      {{> yield}}\n    </div>\n  </div>\n"}];
var laydefault = {"compiler":[5,">= 2.0.0"],"main":function(depth0,helpers,partials,data) {
  var stack1, buffer = "\n  <div id=\"contain\">\n    ";
  stack1 = this.invokePartial(partials.nav, 'nav', depth0, undefined, helpers, partials, data);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n    <div class=\"content\">\n      ";
  stack1 = this.invokePartial(partials['yield'], 'yield', depth0, undefined, helpers, partials, data);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  return buffer + "\n    </div>\n  </div>\n";
},"usePartial":true,"useData":true};
