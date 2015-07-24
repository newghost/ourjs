var test = require("./lib/test");

var extend = function(tar, obj) {
  if (!obj) return;

  for (var key in obj) {
    tar[key] = obj[key];
  }

  return tar;
};

var _ = require("./lib/underscore");

//test method
test("Extend by _.extend:", function() {
  var tar = {
    a: 1, b: "2", c: "3",
    e: { i: "5", j: "6" },
    f: { x: {}, y: [] }
  };

  var obj = {
    b: 123,
    f: { x: [1]}
  };

  _.extend(tar, obj);
  //console.log(tar, obj);
});

test("Extend by simple func:", function() {
  var tar = {
    a: 1, b: "2", c: "3",
    e: { i: "5", j: "6" },
    f: { x: {}, y: [] }
  };

  var obj = {
    b: 123,
    f: { x: [1]}
  };

  extend(tar, obj);
  //console.log(tar, obj);
});

test("String operate by []:", function() {
  var dirPath = 'www/abc/login/';
  dirPath[dirPath.length - 1] == '/';
});

test("String operate by charAt:", function() {
  var dirPath = 'www/abc/login/';
  dirPath.charAt(dirPath.length - 1) == '/';
});