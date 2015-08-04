module.exports = {
  test: function(name, nodes) {
    return name === 'declaration' && nodes[1][1] === 'margin';
  },
  process: function (node) {
    return false; // rm node
  }
};
