module.exports = {

  test: function(name, nodes) {
    return name === 's';
  },

  process: function(node) {
    node[1] = ' ';
    return node;
  }

};
