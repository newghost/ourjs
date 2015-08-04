module.exports = {
  test: function(name, nodes) {
    return name === 'declaration' && nodes[1][1] === 'padding';
  },
  process: function (node) {
    // overwrite node
    node[2] = ['value', ['dimension', ['number', '111'],['ident', 'px']]];
    return node;
  }
};
