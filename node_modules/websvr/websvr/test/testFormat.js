var test = require("./lib/test");

var qs = require("querystring");

var testQuery   = "a=link&b=1&c=abc&f=efg"
var testString  = '{a: "link", b: 1, c: "abc", f: "efg"}';
var testObject  =  {a: "link", b: 1, c: "abc", f: "efg"};

test("Test parse/stringify querystring", function() {
  var string  = qs.stringify(testObject);
  var obj     = qs.parse(string);
  //console.log(string, obj);
});

test("Test parse/stringify json", function() {
  var string  = JSON.stringify(testString);
  var obj     = JSON.parse(string);
  //console.log(string, obj);
});