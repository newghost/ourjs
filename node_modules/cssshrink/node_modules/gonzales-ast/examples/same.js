var g = require('../index.js');
var ast1 = g.parse('a{ margin : 0; padding: 0 }');
var ast2 = g.parse('a{ margin : 0; padding: 0 }');
var ast3 = g.parse('a{ margin:0; padding:0 }');

console.log(String(g.same(ast1, ast2)));
console.log(String(g.same(ast1, ast3)));
