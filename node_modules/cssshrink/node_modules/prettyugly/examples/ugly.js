var prettyugly = require('../index.js');
var read = require('fs').readFileSync;
var gonzo = require('gonzales-ast');

var css = read('example.css', 'utf8').toString();

console.log(prettyugly.ugly(css));
