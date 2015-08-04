var util = require('../util.js');

module.exports = {

  test: function(name, nodes) {
    return name === 'funktion';
  },

  process: function(node) {
    util.trim(node[2]);

    for (var i = 1; i < node[2].length; i++) {
      if (node[2][i][0] === 's') {
        if (util.aroundOperator(node[2], i)) {
          node[2].splice(i, 1);
        }
      }
    }

    return node;
  }

};
