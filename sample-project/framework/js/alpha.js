/*
 * Work backwards from page load
 * 1. Need to load in toolbar
 * 2. Need to load iFrame with the page
 */

var WF = WF || {};

$(function () {
  var loc = window.location.pathname.slice(1);

  // By default look for the "main" page
  if (loc === "") {
    loc = "main";
  }

  var i = document.createElement("iframe");
  i.src = "iframe.html?page=" + loc;
  i.scrolling = "auto";
  i.frameborder = "0";
  i.width = "100%";
  i.height = "100%";
  document.querySelectorAll(".wf-iframe")[0].appendChild(i);
});
