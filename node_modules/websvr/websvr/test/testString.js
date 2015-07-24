var test = require("./lib/test");

var testString   = "/a=link&b=1&c=abc&f=efg"

test("Test string chartAt", function() {
  testString.charAt(0) == '/'
});

test("Test string array", function() {
  testString[0] == '/'
});