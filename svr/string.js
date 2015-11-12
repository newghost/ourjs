(function() {

  var init = function() {
    if(typeof String.prototype.format !== 'function') {
      String.prototype.format = function () {
          for (var b = this, a = 0; a < arguments.length; ++a) b = b.replace(new RegExp("\\{" + a + "\\}", "g"), arguments[a])
          return b
      }
    }

    if(typeof String.prototype.trim !== 'function') {
      String.prototype.trim = function() {
        return this.replace(/^\s+|\s+$/g, '') 
      }
    }
  }

  typeof module !== 'undefined'
    ? (module.exports = init)
    : init()

})();