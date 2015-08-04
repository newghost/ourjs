module.exports = {

  test: function(name, nodes) {
    return name === 'atrulers';
  },

  process: function(node) {
    var pretty = [];
    for (var i = 0; i < node.length; i++) {
      if (node[i][0] === 'ruleset') {
        pretty.push(['s', '\n  ']);
        // go into blocks
        for (var j = 0; j < node[i][2].length; j++) {
          if (node[i][2][j][0] === 's') {
            node[i][2][j][1] = node[i][2][j][1] === '\n'
              ? '\n  '
              : '\n    ';
          }
        }
      }
      pretty.push(node[i]);
    }
    pretty.push(['s', '\n'])
    return pretty;
  }

};
