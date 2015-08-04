module.exports = {

  test: function(name, nodes) {
    return name === 'atrulerq';
  },

  process: function(node) {
    node.push(['s', ' ']);
    return node;
  }

};
