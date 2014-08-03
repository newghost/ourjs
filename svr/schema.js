var fs              = require('fs')
  , path            = require('path')
  , events          = require('events')
  ;


var config          = global.CONFIG
  , GENERAL_CONFIG  = config.GENERAL_CONFIG
  , SCHEMA          = global.SCHEMA = {}
  , DATA_MODELS     = global.DATA_MODELS  = {}
  , notify          = new events.EventEmitter()
  ;

var loadSchema = function() {

  var schemaDir = GENERAL_CONFIG.schemaFolder;

  fs.readdir(schemaDir, function(err, schemas) {
    if (err) {
      console.log('load schema error', err);
      return ;
    }

    var num = 0;

    schemas.forEach(function(schemaName) {
      var schemaPath = path.join(schemaDir, schemaName);
      fs.readFile(schemaPath, function(err, data) {
        num++;

        if (err) {
          console.error('cannot load schema', schemaPath, err);
        } else {
          try {
            SCHEMA[schemaName.replace('.json', '').replace('.js', '')] = JSON.parse(data.toString());
          } catch(e) {
            console.error('parse schema error', schemaName, e.stack || e.message);
          }
        }

        if (num == schemas.length) {
          loadPath();
        }
      });
    });
  });
};


var loadPath = function() {

  /*
  * Init data models
  */
  var modelsPath  = GENERAL_CONFIG.dataModelsDir;

  fs.readdir(modelsPath, function(err, models) {
    if (err) {
      console.log('init DATA_MODELS error', err);
      return ;
    }

    var len = 0;
    models.forEach(function(model) {
      var modelPath = path.join(modelsPath, model);
      fs.stat(modelPath, function(err, stats) {
        len++;
        if (err) {
          console.log('ignore model', modelPath);
        } else {
          if (stats.isDirectory()) {
            DATA_MODELS[model] = modelPath;
          }
        }

        if (len == models.length) {
          notify.emit('done');
        }
      });
    });
  });
};

/*
bit:
0 show in manager list
2 textarea
*/
var filter = function(schemaName, target) {
  var schema = SCHEMA[schemaName];

  if (!schema) {
    console.error("doesn't found schema", schemaName);
    return target;
  }

  for (var key in target) {
    typeof schema[key] == 'undefined' && delete target[key];
  }

  return target;
};


loadSchema();


module.exports = { 
    notify: notify
  , SCHEMA: SCHEMA
  , filter: filter
};