var util = require('../util.js');

module.exports = {

  test: function(name, nodes) {
    return (
      name === 'block' ||
      name === 'simpleselector' ||
      name === 'value'
    );
  },

  process: function(node) {

    for (var i = 1; i < node.length; i++) {
      if (node[i][0] === 's') {
        if (node[i - 1] && node[i - 1][0] === 's') {
          node.splice(i, 1);
        }
      }
    }

    return node;
  }

};
