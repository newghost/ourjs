module.exports = {

  test: function(name, nodes) {
    return name === 'block';
  },

  process: function(node) {
    var delim_added = false;
    var decl_found = false;
    return node.filter(function(n) {

      if (n[0] === 'declaration') {
        decl_found = true;
      }

      if (n[0] !== 'decldelim') {
        delim_added = false;
        return true;
      }
      if (delim_added) {
        return false;
      }

      if (!decl_found) { // leading delimiter, forget it
        return false;
      }

      delim_added = true;
      return true;
    });
  }

};
