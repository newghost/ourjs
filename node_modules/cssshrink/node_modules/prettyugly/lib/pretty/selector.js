module.exports = {

  test: function(name, nodes) {
    return name === 'selector';
  },

  process: function(node) {
    for (var i = 0; i < node.length; i++) {
      if (node[i][0] === 'simpleselector') {
        if (node[i + 1] && node[i + 1][0] === 'delim') {
          if (i > 1) {
            node[i].splice(1, 0, ['s', ' ']);
          }
        } else {
          if (i > 1) {
            node[i].splice(1, 0, ['s', ' ']);
          }
          node[i].push(['s', ' ']);
        }
      }
    }
    return node;
  }

};
