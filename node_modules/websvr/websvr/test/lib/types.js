#!/usr/bin/env node
/*
Pickup mime type from mime.types files (node-mime);
*/
var fs 	  = require("fs"),
    types = "./types/mime.types";

//remove the space/tab/comments
var readLines = function(trunk) {
  var lines = [];

  //format the EOL, keep the same with (win & linux)
  var body = trunk.toString().replace('\r', '');

  //remove comments: /* comthing */
  //body = body.replace(/\/\*.*\*\//g, '');
  body.split('\n').forEach(function(line) {
    lines.push(line.trim());
  });

  return lines;
};

var pickup = function(lines) {

  var result = {};

  lines.forEach(function(line, idx) {
    //
    if (line[0] != '#') {

      //pickup values in attribute
      var pair  = line.split(/[ \t]+/),
          l     = pair.length;

      if (l > 1 && pair[0]) {
        for (var i = 1; i < l; i++) {
          pair[i] && ( result[pair[i]] = pair[0] );
        }
      };
    }
  });

  fs.writeFileSync("MIMETYPES.js", "var MIMETYPES = module.exports = " + JSON.stringify(result, null, '  ') + ';');
};

fs.readFile(types, function(err, trunk) {
  if (err) throw err;
  
  var lines = readLines(trunk);
  pickup(lines);
});