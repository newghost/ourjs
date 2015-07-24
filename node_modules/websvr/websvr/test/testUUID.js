var UUIDjs  = require("./lib/uuid"),
    test    = require("./lib/test");

var websvr = require('../websvr')().stop();

(function() {
  // Private array of chars to use
  var CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');

  Math.uuid = function (len, radix) {
    var chars = CHARS, uuid = [], i;
    radix = radix || chars.length;

    if (len) {
      // Compact form
      for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random()*radix];
    } else {
      // rfc4122, version 4 form
      var r;

      // rfc4122 requires these characters
      uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
      uuid[14] = '4';

      // Fill in random data.  At i==19 set the high bits of clock sequence as
      // per rfc4122, sec. 4.1.5
      for (i = 0; i < 36; i++) {
        if (!uuid[i]) {
          r = 0 | Math.random()*16;
          uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
        }
      }
    }

    return uuid.join('');
  };

  // A more performant, but slightly bulkier, RFC4122v4 solution.  We boost performance
  // by minimizing calls to random()
  Math.uuidFast = function() {
    var chars = CHARS, uuid = new Array(36), rnd=0, r;
    for (var i = 0; i < 36; i++) {
      if (i==8 || i==13 ||  i==18 || i==23) {
        uuid[i] = '-';
      } else if (i==14) {
        uuid[i] = '4';
      } else {
        if (rnd <= 0x02) rnd = 0x2000000 + (Math.random()*0x1000000)|0;
        r = rnd & 0xf;
        rnd = rnd >> 4;
        uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
      }
    }
    return uuid.join('');
  };

  // A more compact, but less performant, RFC4122v4 solution:
  Math.uuidCompact = function() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
      return v.toString(16);
    });
  };
})();

//Conver to array will make it slower;
var CHARS     = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
var CHARSArr  = CHARS.split('');

var SCHARS    = "0123456789ABCDEF";
var SCHARSArr = SCHARS.split('');

console.log("Testing long chars:");

test("Math.uuid(32)", function() {
  Math.uuid(32);
});

test("Math.uuidFast", function() {
  Math.uuidFast();
});

test("UUIDjs.create", function() {
  UUIDjs.create();
});

var createUUID = function() {
  var create = function() {
    return (Math.random() * 0x10000 | 0).toString(16);
  };

  var uuid = new Array(8);
  for (var i = 0; i < 8; i++) {
    uuid[i] = (Math.random() * 0x10000 | 0).toString(16);
  }
};

test("createUUID", function() {
  createUUID();
});

test("UUID fixed array", function() {
  //Using fixed size array will be more faster than "new Array()"
  var uuid = new Array(32);
  for (var i = 0; i < 32; i++) {
    uuid[i] = CHARS[0 | Math.random() * 36];
  }
  uuid = uuid.join();
});

test("UUID string plus", function() {
  var uuid = "";
  for (var i = 0; i < 32; i++) {
    uuid += CHARS[0 | Math.random() * 36];
  }
});

test("UUIDArr string plus", function() {
  var uuid = "";
  for (var i = 0; i < 32; i++) {
    uuid += CHARSArr[0 | Math.random() * 36];
  }
});

test("UUIDArr fixed array", function() {
  //Using fixed size array will be more faster than "new Array()"
  var uuid = new Array(32);
  for (var i = 0; i < 32; i++) {
    uuid[i] = CHARSArr[0 | Math.random() * 36];
  }
  uuid = uuid.join();
});

console.log("\r\n\r\nTesting short chars:");

test("UUID fixed array", function() {
  //Using fixed size array will be more faster than "new Array()"
  var uuid = new Array(32);
  for (var i = 0; i < 32; i++) {
    uuid[i] = SCHARS[0 | Math.random() * 16];
  }
  uuid = uuid.join();
});

test("UUID string plus", function() {
  var uuid = "";
  for (var i = 0; i < 32; i++) {
    uuid += SCHARS[0 | Math.random() * 16];
  }
});

test("UUIDArr string plus", function() {
  var uuid = "";
  for (var i = 0; i < 32; i++) {
    uuid += SCHARSArr[0 | Math.random() * 16];
  }
});

test("UUIDArr fixed array", function() {
  //Using fixed size array will be more faster than "new Array()"
  var uuid = new Array(32);
  for (var i = 0; i < 32; i++) {
    uuid[i] = SCHARSArr[0 | Math.random() * 16];
  }
  uuid = uuid.join();
});

//interval is 4 hours
test("UUIDArr fixed array final", function() {  
  var suuid = (+new Date()) / 14400000;

  var uuid = new Array(32);
  for (var i = 0; i < 32; i++) {
    uuid[i] = SCHARSArr[0 | Math.random() * 16];
  }

  suuid += "-" + uuid.join('');
});

test("Custom session id, with full Date", function() {
  var uuid 
    = (+new Date())                        //Time stamp, change interval is 0.583 hours, higher 11 bits will be kept
    + '-'
    + ((Math.random() * 0x40000000 | 0))   //Random 1: Used for distinguish the session
    + ((Math.random() * 0x40000000 | 0));  //Random 2: Used for distinguish the session

  uuid  += '0000000000'.substr(0, 25 - uuid.length);
});

test("Custom session id, with short Date", function() {
  var uuid 
    = ((+new Date()) / 60000 | 0)          //Time stamp, change interval is 0.583 hours, higher 11 bits will be kept
    + '-'
    + ((Math.random() * 0x40000000 | 0))   //Random 1: Used for distinguish the session
    + ((Math.random() * 0x40000000 | 0));  //Random 2: Used for distinguish the session

  uuid  += '0000000000'.substr(0, 25 - uuid.length);
});

test("Test default Session ID", function() {
  var newID = websvr.newID();
});

test("Test Session ID with appended chars", function() {
  var newID = websvr.newID(3);
});