/*!@preserve
* OurJS     : Free Blog Engine, Forum System, Website Template and CMS Platform based on Node.JS
* Copyright : Kris Zhang <kris.newghost@gmail.com>
* Homepage  : http://code.ourjs.com
* Project   : https://github.com/newghost/ourjs
* License   : BSD
*/

var fs              = require('fs')
  , path            = require('path')
  , events          = require('events')



var config          = global.CONFIG
  , GENERAL_CONFIG  = config.GENERAL_CONFIG
  , SCHEMA          = global.SCHEMA = {}
  , DATA_MODELS     = global.DATA_MODELS  = {}
  , notify          = new events.EventEmitter()


var loadSchema = function() {

  var schemaDir = GENERAL_CONFIG.schemaFolder

  fs.readdir(schemaDir, function(err, schemas) {
    if (err) {
      console.log('load schema error', err)
      return 
    }

    var num = 0

    schemas.forEach(function(schemaName) {
      var schemaPath = path.join(schemaDir, schemaName)
      fs.readFile(schemaPath, function(err, data) {
        num++

        if (err) {
          console.error('cannot load schema', schemaPath, err)
        } else {
          try {
            SCHEMA[schemaName.replace('.json', '').replace('.js', '')] = JSON.parse(data.toString())
          } catch(e) {
            console.error('parse schema error', schemaName, e.stack || e.message)
          }
        }

        if (num == schemas.length) {
          loadPath()
        }
      })
    })
  })
}


var loadPath = function() {

  /*
  * Init data models
  */
  var modelsPath  = GENERAL_CONFIG.dataModelsDir

  fs.readdir(modelsPath, function(err, models) {
    if (err) {
      console.log('init DATA_MODELS error', err)
      return 
    }

    var len = 0
    models.forEach(function(model) {
      var modelPath = path.join(modelsPath, model)
      fs.stat(modelPath, function(err, stats) {
        len++
        if (err) {
          console.log('ignore model', modelPath)
        } else {
          if (stats.isDirectory()) {
            DATA_MODELS[model] = modelPath
          }
        }

        if (len == models.length) {
          notify.emit('done')
        }
      })
    })
  })
}

/*
bit:
0 show in manager list
2 textarea
*/
var filter = function(schemaName, target) {
  var schema  = SCHEMA[schemaName]
    , flag    = true

  if (!schema) {
    console.error("doesn't found schema", schemaName)
    return target
  }

  for (var key in target) {
    var rule  = schema[key];

    if (typeof rule == 'undefined') {
      delete target[key]
    } else {
      var value = target[key];

      //int? convert value to int
      var intIdx = rule.indexOf('int');
      if (intIdx > -1) {
        value = parseInt(value) || 0
        target[key] = value
      }

      var minIdx = rule.indexOf('min(');
      if (minIdx > -1) {
        var minVal = rule.substr(minIdx + 4);
        minVal = minVal.substr(0, minVal.indexOf(')'));
        if (value && value.length < parseInt(minVal)) {
          flag = false;
        }
      }

      var maxIdx = rule.indexOf('max(');
      if (maxIdx > -1) {
        var maxVal = rule.substr(maxIdx + 4);
        maxVal = maxVal.substr(0, maxVal.indexOf(')'));
        if (value && value.length > parseInt(maxVal)) {
          flag = false;
        }
      }

      var require = rule.indexOf('require');
      if (require > -1) {
        if (!value) {
          flag = false;
        }
      }
    }
  }

  return flag;
}


/*
formatter
*/
var parse = function(schemaName, target) {
  var schema  = SCHEMA[schemaName]

  if (!schema) {
    console.error("doesn't found schema", schemaName)
    return
  }

  for (var key in target) {
    var rule  = schema[key]
      , value = target[key]
      , type  = typeof value

    if (rule.indexOf('int')) {
      target[key] = parseInt(value) || 0
    }

    else if ((rule.indexOf('array') > -1 || rule.indexOf('json') > -1) && type == 'string') {
      try {
        target[key] = JSON.parse(value || '{}')
      } catch (e) {
        console.error(schemaName, target, e)
        return
      }
    }
  }

  return target
}



var stringify = function(schemaName, target) {
  var schema  = SCHEMA[schemaName]

  if (!schema) {
    console.error("doesn't found schema", schemaName)
    return
  }

  for (var key in target) {
    var rule  = schema[key]
      , value = target[key]
      , type  = typeof value

    if ((rule.indexOf('array') > -1 || rule.indexOf('json') > -1) && type == 'object' && value) {
      try {
        target[key] = JSON.stringify(value)
      } catch (e) {
        console.error(schemaName, target, e)
        return
      }
    }
  }

  return target
}

loadSchema()


module.exports = { 
    notify    : notify
  , SCHEMA    : SCHEMA
  , filter    : filter
  , parse     : parse
  , stringify : stringify
}