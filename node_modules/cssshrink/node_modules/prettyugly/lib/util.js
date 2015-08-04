exports.trim = function trim(ast) {
  if (ast.length < 2) {
    return; // already empty, nothing to trim
  }
  if (ast[ast.length - 1][0] === 's') {
    ast.pop();
  }
  if (ast[1] && ast[1][0] === 's') {
    ast.splice(1, 1);
  }
};

exports.trimRight = function trim(ast) {
  if (ast.length < 2) {
    return; // already empty, nothing to trim
  }
  if (ast[ast.length - 1][0] === 's') {
    ast.pop();
  }
};

exports.trimBraces = function trim(ast) {
  if (ast.length < 4) {
    return; // already empty, nothing to trim
  }
  if (ast[3] && ast[3][0] === 's') {
    ast.splice(3, 1);
  }
};

exports.trimPrevNext = function trim(node, i) {
  var prev = node[i - 1];

  if (prev && prev[0] === 's') {
    node.splice(i - 1, 1)
    i--;
  }
  var next = node[i + 1];
  if (next && next[0] === 's') {
    node.splice(i + 1, 1);
  }
};

exports.aroundOperator = function aroundOperator(node, i) {
  var prev = node[i - 1];
  var next = node[i + 1];
  return (
    (prev && prev[0] === 'operator') ||
    (next && next[0] === 'operator') ||
    (prev && prev[0] === 'ident' && prev[1] === '*') ||
    (next && next[0] === 'ident' && next[1] === '*')
  );
};
