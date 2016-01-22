/*
Description: $.fn.view
Author: Kris Zhang
*/
;(function($) {

  $.fn.view = function(model, options) {

    options = options || {}

    var formatter = options.formatter

    var setValue = function() {
      var bind  = this
        , $bind = $(bind)
        , tag   = bind.tagName
        , key   = $bind.attr('data-bind')
        , val   = model[key]

      if (formatter) {
        val = formatter.call(bind, val)
      }

      if (typeof val != 'undefined') {
        if (tag == 'INPUT' || tag == "TEXTAREA" || tag == "SELECT") {
          $bind.val(val)
        } else {
          $bind.html(val)
        }
      }
    }

    var setVisible = function() {
      var visible   = this
        , $visible  = $(visible)
        , isHow    = $visible.attr('data-show')
        , key       = $visible.attr('data-show') || $visible.attr('data-hide') || ''
        , val       = model[key]

      if (isHow) {
        val
          ? $visible.show()
          : $visible.hide()
      } else {
        val
          ? $visible.hide()
          : $visible.show()
      }
    }

    return this.each(function() {
      var self    = this
        , $this   = $(self)

      if (typeof model == 'object') {
        $this.find('[data-bind]').each(setValue)
        $this.find('[data-show],[data-hide]').each(setVisible)
      }
    })
  }

})(jQuery);