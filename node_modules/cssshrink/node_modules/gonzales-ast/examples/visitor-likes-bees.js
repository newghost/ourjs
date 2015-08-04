module.exports = {
  test: function(name, nodes) {
    return name === 'selector';
  },
  process: function (node) {
    // add two new elements to the ast tree
    node.push(['delim'], ['simpleselector', ['ident', 'b']]);
    return node;
  }
};
