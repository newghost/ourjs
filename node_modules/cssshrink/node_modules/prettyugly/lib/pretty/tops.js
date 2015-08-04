module.exports = {

  test: function(name, nodes) {
    return name === 'stylesheet';
  },

  process: function(node) {
    var pretty = [];
    for (var i = 0; i < node.length; i++) {
      if (i > 0 && node[i][0] !== 's') {
        pretty.push(['s', '\n']);
        pretty.push(node[i]);
        pretty.push(['s', '\n']);
      } else {
        pretty.push(node[i]);
      }
    }
    pretty.push(['s', '\n']);
    return pretty;
  }

};
