module.exports = {

  test: function(name, nodes) {
    return name === 'value';
  },

  process: function(node) {
    node.splice(1, 0, ['s', ' ']);
    return node;
  }

};
