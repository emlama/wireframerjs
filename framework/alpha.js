/*
 * Work backwards from page load
 * 1. Need to load in toolbar
 * 2. Need to load iFrame with the page
 */

var WF = WF || {};

$(function () {
  var i = document.createElement("iframe");
  i.src = "iframe.html?queryParam=true";
  i.scrolling = "auto";
  i.frameborder = "0";
  i.width = "200px";
  i.height = "100px";
  document.querySelectorAll(".wf-iframe")[0].appendChild(i);
});
>>>>>>> FETCH_HEAD
