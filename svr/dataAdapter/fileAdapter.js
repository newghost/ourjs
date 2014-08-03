//Database operator
var fs              = require('fs')
  , path            = require('path')
  , mongodb         = require('mongodb')
  , MongoClient     = mongodb.MongoClient
  , BSON            = mongodb.BSONPure
  , ObjectID        = BSON.ObjectID
  , utility         = require('../utility')
  , config          = global.CONFIG
  , DATA_MODELS     = global.DATA_MODELS
  , MESSAGES        = config.MESSAGES
  ;

var adapter = {}
  , _cb     = new Function()
  ;

/*
API:
  adapter.select(id, table, callback)
  adapter.select(table, callback)
*/
adapter.select = function(_id, table, cb) {
  if (arguments.length < 3) {
    cb = table || _cb;
    table = _id;
    _id = undefined;
  } else {
    cb = cb || _cb;
  }

  var dir = DATA_MODELS[table];

  if (!dir) {
    console.log(MESSAGES.SERVER_DATA_SYNC_ERROR, arguments);
    return cb([]);
  }

  if (_id) {
    fs.readFile(path.join(dir, _id), function(err, data) {
      if (err) {
        console.log('adapter select err', err);
      } else {
        try {
          return cb([JSON.parse(data)]);
        } catch(e) {
          console.log('adapter select parse err', err);
        }
      }
      cb([]);
    });
  } else {
    fs.readdir(dir, function(err, files) {
      if (err) {
        console.log(err);
        return cb([]);
      }

      var num     = 0
        , result  = []
        ;

      files.forEach(function(file) {
        fs.readFile(path.join(dir, file), function(err, data) {
          num++;

          if (err) {
            console.log(err);
          } else {
            try {
              result.push(JSON.parse(data));
            } catch(e) {
              console.log(e);
            }
          }

          num == files.length && cb(result);
        });
      });
    });
  }
};

adapter.insert = function(table, article, cb) {
  var dir = DATA_MODELS[table];
  cb = cb || _cb;

  if (!dir) {
    console.log(MESSAGES.SERVER_DATA_SYNC_ERROR, arguments);
    return cb(false);
  }

  article._id       = ObjectID().toString();

  var file = path.join(dir, article._id);

  fs.writeFile(file, JSON.stringify(article), function(err) {
    if (err) {
      console.log(err);
      return cb(false);
    }
    return cb(true);
  });
};

adapter.update = function(_id, table, updateJSON, cb) {
  var dir = DATA_MODELS[table];
  cb = cb || _cb;

  if (!dir) {
    console.log(MESSAGES.SERVER_DATA_SYNC_ERROR, arguments);
    return cb(false);
  }

  var file = path.join(dir, _id);

  fs.readFile(file, function(err, data) {
    if (err) {
      console.log(err);
      return cb(false);
    }

    try {
      var article = JSON.parse(data);
    } catch (e) {
      return cb(false);
    }

    var oldId = updateJSON._id;
    delete updateJSON._id;
    utility.extend(article, updateJSON);
    fs.writeFile(file, JSON.stringify(article), function(err) {
      if (err) {
        console.log(err);
        return cb(false);
      }
      oldId && (updateJSON._id = oldId);
      cb(true);
    });
  });
};

adapter.delete = function(_id, table, cb) {
  var dir = DATA_MODELS[table];
  cb = cb || _cb;

  if (!dir) {
    console.log(MESSAGES.SERVER_DATA_SYNC_ERROR, arguments);
    return cb(false);
  }

  var file = path.join(dir, _id);

  fs.unlink(file, function(err) {
    if (err) {
      console.log(err);
      return cb(false);
    }
    cb(true);
  });
};

module.exports = adapter;