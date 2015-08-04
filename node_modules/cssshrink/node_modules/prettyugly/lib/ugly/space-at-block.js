var util = require('../util.js');

module.exports = {

  test: function(name, nodes) {
    return name === 'atruleb';
  },

  process: function(node) {
    for (var i = 1; i < node.length; i++) {
      if (node[i][0] === 'block') {
        util.trimPrevNext(node, i);
      }
    }

    return node;
  }

};
