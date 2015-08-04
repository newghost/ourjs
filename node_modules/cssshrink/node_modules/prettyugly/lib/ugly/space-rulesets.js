var util = require('../util.js');

module.exports = {

  test: function(name, nodes) {
    return name === 'stylesheet' || name === 'atrulers';
  },

  process: function(node) {
    var newnode = [];
    newnode.push(node[0]);
    for (var i = 1; i < node.length; i++) {
      if (node[i][0] !== 's') {
        newnode.push(node[i]);
      }
    }
    return newnode;
  }

};
