// add space after first-(line|letter)

module.exports = {

  test: function(name, nodes) {
    return name === 'pseudoc' || name === 'pseudoe';
  },

  process: function(node) {
    var val = node[1][1];
    if (val === 'first-line' || val === 'first-letter') {
      node[1][1] += ' ';
    }
    return node;
  }
};
