/*!@preserve
* OurJS       : Free Blog Engine, Forum System, Website Template and CMS Platform based on Node.JS
* Author      : Kris Zhang <kris.newghost@gmail.com>
* License     : BSD
*/

var fs              = require('fs')
  , path            = require('path')
  , config          = global.CONFIG



var load = function(module) {
  var modulePath = path.join(__dirname, module)

  fs.stat(modulePath, function(err, states) {
    if (err) {
      return
    }

    if (states.isDirectory()) {
      fs.readFile(path.join(modulePath, 'package.json'), function(err, data) {
        if (err) {
          return
        }

        try {
          var pakcageJSON = JSON.parse(data.toString())
          pakcageJSON.main && require(path.join(module, pakcageJSON.main))
          console.log('module loaded:', module)
        } catch (err) {
          console.log('module load failed:', module)
          console.log(err)
        }
      })
    }
  })
}


var init = function(modleFolder) {
  var moduleFolderPath = path.join(__dirname, modleFolder)
  fs.readdir(moduleFolderPath, function(err, modules) {
    if (err) {
      console.error(err)
      return
    }

    modules.forEach(function(module) {
      var modulePath = path.join(modleFolder, module)

      //忽略隐藏目录
      if (module == '.') {
        return
      }

      //安装目录下的文件 module
      else if (module.indexOf('.js') === module.length - 3) {
        try {
          require(modulePath)
          console.log('module loaded:', modulePath)
        } catch (err) {
          console.log('module load failed:', modulePath)
          console.log(err)
        }
      }

      //安装目录下的文件夹　module
      else {
        load(modulePath)
      }
    })
  })

  //安装目录下的js插件
  fs.readdir(moduleFolderPath, function(err, plugins) {
    if (err) {
      console.error(err)
      return
    }

    for (var i = 0; i < plugins.length; i++) {
      var plugin = plugins[i]

      if (plugin.indexOf('.js') !== plugin.length - 3) {
        return
      }

      try {
        require('../mod/' + plugin)
        console.log('Plugin loaded', plugin)
      } catch (err) {
        console.error('Cannot load plugin', plugin, err)
      }
    }
  })

}



module.exports = {
    init : init
  , load : load
}