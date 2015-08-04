module.exports = {

  test: function(name, nodes) {
    return name === 'block';
  },

  process: function(node) {
    if (node[node.length - 1][0] === 'decldelim') {
      node.pop();
    }
    return node;
  }

};
