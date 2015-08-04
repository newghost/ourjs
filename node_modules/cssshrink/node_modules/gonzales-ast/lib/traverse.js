function tree(node, visitor) {
  if (!Array.isArray(node)) {
    return node;
  }

  if (visitor.test && visitor.test(node[0], node[1])) {
    node = visitor.process(node);
    if (!node) {
      return;
    }
  }

  var res = [node[0]];
  for (var i = 1; i < node.length; i++) {
    var n = tree(node[i], visitor);
    n && res.push(n);
  }
  return res;
}


module.exports = function traverse (ast, visitors) {
  visitors.forEach(function(visitor) {
    ast = tree(ast, visitor);
  });
  return ast;
};
