#!/usr/bin/env node

var prettyugly = require("../index.js");
var read = require('fs').readFileSync;
var css = read(process.argv[3], 'utf8').toString();

console.log(prettyugly[process.argv[2] === 'pretty' ? 'pretty' : 'ugly'](css));
