var gonzo = require('gonzales-ast');

parse = function(css) {
  var ast = gonzo.parse(css);
  return gonzo.toTree(ast);
}

