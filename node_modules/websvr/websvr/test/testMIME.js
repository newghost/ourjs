#!/usr/bin/env node
var test      = require("./lib/test"),
    mime      = require("./lib/mime");
    MIMETYPES = require('./lib/MIMETYPES.js');

var urls = [
      "http://www.github.com/appmobi/jq.html",
      "stringify/appmobi.lok.mp3",
      "good/soha.shtml",
      "abcdefg/appmobi.look/abcdefgg.good"
    ];

/*
  It'll be sure that:
  1) The url must indicate to a file.
  2) There will be no query string.
  3) Length of extension will be less than 10.
*/
var lookup = function(url) {
  var idx = url.lastIndexOf('.') + 1,
      type;

  (idx > 0 ) && (type = MIMETYPES[url.substr(idx, 10)]);

  return type || "application/octet-stream";
};

test("Test mime.lookup == mime.custom", function() {
  urls.forEach(function(url) {
    console.log(mime.lookup(url) == lookup(url), lookup(url), mime.lookup(url), url);
  });
}, 1);

test("Test mime.lookup", function() {
  urls.forEach(function(url) {
    mime.lookup(url);
  });
});

test("Test mime.custom", function() {
  urls.forEach(function(url) {
    lookup(url);
  });
});