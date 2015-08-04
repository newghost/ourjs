var util = require('../util.js');

module.exports = {

  test: function(name, nodes) {
    return name === 'atrulerq';
  },

  process: function(node) {

    if (node[1][0] === 's' && node[2][0] === 'braces') {
      util.trim(node);
    } else {
      util.trimRight(node);
    }

    for (var i = 1; i < node.length; i++) {
      if (node[i][0] === 'operator') {
        util.trimPrevNext(node, i);
      }
    }

    return node;
  }

};
