var util = require('../util.js');

module.exports = {

  test: function(name, nodes) {
    return name === 'value';
  },

  process: function(node) {
    for (var i = 1; i < node.length; i++) {
      if (node[i][0] === 'important') {
        util.trimPrevNext(node, i);
      }
    }
    return node;
  }

};
