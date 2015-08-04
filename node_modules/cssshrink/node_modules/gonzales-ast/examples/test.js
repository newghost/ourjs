var g = require('../index.js');
var ast = g.parse('a{ margin : 0; padding: 0 }');

ast = g.traverse(ast, [
  require('./visitor-likes-bees.js'), // add stuff to AST
  require('./visitor-likes-em-big-paddings.js'), // change values
  require('./visitor-hates-margins.js'), // remove from AST
]);

console.log(g.toCSS(ast)); // a,b{ ; padding:111px}

