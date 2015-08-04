module.exports = {

  test: function(name, nodes) {
    return name === 'block';
  },

  process: function(node) {
    var pretty = [];
    for (var i = 0; i < node.length; i++) {
      if (node[i][0] === 'declaration') {
        pretty.push(['s', '\n  ']);
      }
      pretty.push(node[i]);
    }
    pretty.push(['s', '\n']);
    return pretty;
  }

};
