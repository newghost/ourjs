module.exports = {

  test: function(name, nodes) {
    return name === 'comment';
  },

  process: function(node) {

    var text = node[1];

    // important comments
    if (text.charAt(0) === '!') {
      // trim trailing space
      node[1] = text.trim();
      return node;
    }

    // ie mac hack ends
    if (this.ie5machack) { 
      this.ie5machack = false;
      node = ['raw', '/**/'];
      return node;
    }

    // ie5 mac hack starts
    if (text.charAt(text.length - 1) === '\\') {
      this.ie5machack = true;
      node[1] = '\\'; // minify the hack
      return node;
    }

    // return nothing, delete the comment
  },
  
  ie5machack: false

};
