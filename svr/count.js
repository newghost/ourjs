/*!@preserve
* OurJS     : Free Blog Engine, Forum System, Website Template and CMS Platform based on Node.JS
* Copyright : Kris Zhang <kris.newghost@gmail.com>
* Homepage  : http://code.ourjs.com
* Project   : https://github.com/newghost/ourjs
* License   : BSD
*/

/*
Count and Analysis Modules
*/
var fs      = require('fs')
  , path    = require('path')
  , utility = require('./utility')


var Count = function(name, dir) {
  if (!name && !dir) {
    console.log('Cannot init: Count(name, folder)')
    return
  }

  var self = this

  self.countName    = name
  self.countPool    = {}
  //sort of ids
  self.countSort    = []
  self.rootPath     = dir

  //sort of articles
  self.hottest      = []

  self.init()
}

Count.prototype = {
    //100 miniutes: 6000000
    delay:      60000
  , delayTimer: null
  , init: function() {
    var self = this

    fs.readdir(self.rootPath, function(err, files) {
      if (err) {
        console.log(err)
        return
      }

      files.sort(function(a, b) {
        var aArr = a.split('-')
          , bArr = b.split('-')


        if (aArr[0] !== self.countName) {
          return bArr[0] === self.countName ? 1 : 0
        } else {
          var flag = (parseInt(bArr[1]) || 0) - (parseInt(aArr[1]) || 0)
          flag === 0 && (flag = (parseInt(bArr[2]) || 0) - (parseInt(aArr[2]) || 0))
          return flag
        }
      })

      fs.readFile(path.join(self.rootPath, files[0] || self.countName), function(err, data) {
        if (err) {
          console.log(err)
          return
        }

        try {
          self.countPool = JSON.parse(data)
        } catch(e) {
          self.countPool = {}
        }
      })
    })
  }
  , add: function(key) {
    var self = this
    self.countPool[key] === undefined && (self.countPool[key] = 0)
    self.countPool[key]++

    /*
    * Thread hold some time to save the count results, avoiding writing too frequently
    */
    if (self.delayTimer) {
      return
    }

    self.delayTimer = setTimeout(function() {
      clearTimeout(self.delayTimer)
      self.delayTimer = null
      self.save()
    }, self.delay)
  }
  , get: function(key) {
    var self = this
    return self.countPool[key] || 0
  }
  , getCountName: function() {
      var date  = new Date()
        , tag   = this.countName + '-' + date.getFullYear() + '-' + (date.getMonth() + 1)

      return tag
  }
  , save: function() {
    var self = this
    console.log('Save Counts', self.countName)
    fs.writeFile(path.join(self.rootPath, self.getCountName()), JSON.stringify(self.countPool), function(err) {
      console.log(err)
    })
  }
  , refresh: function(Cache) {
    var self = this

    setInterval(function() {
      self.hotm()
      Cache && (self.hottest = Cache.getTitleFromIDs(self.countSort))
    }, 24 * 3600 * 1000)
    self.hotm()
    Cache && (self.hottest = Cache.getTitleFromIDs(self.countSort))
  }
  /*monthly hottest*/
  , hotm: function() {
      var self = this

      // First create the array of keys/net_total so that we can sort it:
      var sort_array = []
      for (var key in self.countPool) {
        sort_array.push({key: key, count: self.countPool[key]})
      }
      sort_array.sort(function(x, y) {
        return y.count - x.count
      })


      var duration = 3600 * 24 * 30 * 1000

      // Empty the array
      self.countSort.length = 0
      for (var i = 0; i < sort_array.length; i++) {
        var articleCount = sort_array[i]
        if ( new Date() - utility.getTimeFromObjectID(articleCount.key) < duration) {
          self.countSort.push(articleCount.key)
        }
      }
  }
}

module.exports = Count