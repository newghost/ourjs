var test = require("./lib/test");

var create = function() {
  //Time stamp, change interval is 18.641 hours, higher 6 bits will be kept, this is used for delete the old sessions
  var uuid 
    = ((+new Date()) / 60000 | 0)           //Time stamp, change interval is 1 min, 8 chars
    + '-'
    + ((Math.random() * 0x4000000 | 0))    //Random 1: Used for distinguish the session, max 9 chars
    + ((Math.random() * 0x4000000 | 0));   //Random 2: Used for distinguish the session, max 9 chars

  //fix the length to 25
  //uuid += '0000000000'.substr(0, 25 - uuid.length);

  return uuid;
};

test("SessionManager.create: test length", function() {

  var max = 0, min = 1000;
  for (var i = 0; i < 1000000; i ++) {
    var len = create().length;

    (len > max) && (max = len);
    (len < min) && (min = len);
  }

  console.log("min:", min, "max:", max);

}, 1);

test("Test parse Int string: | 0", function() {
  var rnd = "18999334.3415921676";
  rnd = rnd | 0;
});

test("Test parse Int string: parseInt", function() {
  var rnd = "18999334.3415921676";
  rnd = parseInt(rnd);
});

test("Test parse Int float: | 0", function() {
  var rnd = 18999334.3415921676;
  rnd = rnd | 0;
});

test("Test parse Int float: parseInt", function() {
  var rnd = 18999334.3415921676;
  rnd = parseInt(rnd);
});