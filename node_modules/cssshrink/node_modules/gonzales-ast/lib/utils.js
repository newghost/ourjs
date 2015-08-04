exports.same = function same (ast1, ast2) {
  return JSON.stringify(ast1) === JSON.stringify(ast2);
};
