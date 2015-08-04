var util = require('../util.js');

module.exports = {

  test: function(name, nodes) {
    return (
      name === 'stylesheet' ||
      name === 'ruleset' ||
      name === 'block' ||
      name === 'selector' ||
      name === 'simpleselector' ||
      name === 'declaration' ||
      name === 'property' ||
      name === 'value' ||
      name === 'atrules' ||
      name === 'atrulers' ||
      name === 'atkeyword' ||
      name === 'braces'
    );
  },

  process: function(node) {
    util.trim(node);
    
    // special case, these have two more "intro" nodes, namely ( and )
    if (node[0] === 'braces') { 
      util.trimBraces(node);
    }
    
    return node;
  }

};
