//Test method
var os = require("os");

var test = module.exports = function(msg, func, repeat) {

  var t1 = new Date(),
      m1 = os.freemem();

  repeat = repeat || 1000000;

  for (var i = 0; i < repeat; i++) {
    func();
  }

  var t2 = new Date(),
      m2 = os.freemem();

  console.log("\r\n" + msg);
  console.log("    time used:", t2 - t1);
  console.log("    memo used:", m1 - m2);

};