module.exports = {

  test: function(name, nodes) {
    return name === 'block';
  },

  process: function(node) {
    if (node[node.length - 2] && node[node.length - 2][0] !== 'decldelim') {
      node.splice(node.length - 1, 0, ['decldelim']);
    }
    return node;
  }

};
