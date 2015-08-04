var util = require('../util.js');

module.exports = {

  test: function(name, nodes) {
    return name === 'value' || name === 'braces';
  },

  process: function(node) {
    for (var i = 1; i < node.length; i++) {
      if (node[i][0] === 's') {
        if (util.aroundOperator(node, i)) {
          node.splice(i, 1);
        }
      }
    }
    return node;
  }

};
