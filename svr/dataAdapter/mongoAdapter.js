/*!@preserve
* OurJS     : Free Blog Engine, Forum System, Website Template and CMS Platform based on Node.JS
* Copyright : Kris Zhang <kris.newghost@gmail.com>
* Homepage  : http://code.ourjs.com
* Project   : https://github.com/newghost/ourjs
* License   : BSD
*/

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
  , GENERAL_CONFIG  = config.GENERAL_CONFIG
  , CONNECTIONSTR   = GENERAL_CONFIG.CONNECTIONSTR
  ;

var adapter = {}
  , _cb     = new Function()
  ;

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

  MongoClient.connect(CONNECTIONSTR, function(err, db) {
    if (err) {
      console.log(MESSAGES.SERVER_DATA_SYNC_ERROR, err);
      return cb([]);
    }

    db.collection(table, function(err, collection) {
      if (err) {
        console.log(MESSAGES.SERVER_DATA_SYNC_ERROR, err);
        return cb([]);
      }

      collection.find(_id ? { _id: ObjectID(_id) } : {}).toArray(function(err, docs) {
        if (err) {
          console.log(MESSAGES.SERVER_DATA_SYNC_ERROR, err);
        }

        db.close();
        cb(docs.map(function(doc) { doc._id = doc._id.toString(); return doc }) || []);
      });
    });
  });
};

adapter.insert = function(table, article, cb) {
  var dir = DATA_MODELS[table];
  cb = cb || _cb;

  if (!dir) {
    console.log(MESSAGES.SERVER_DATA_SYNC_ERROR, arguments);
    return cb(false);
  }

  MongoClient.connect(CONNECTIONSTR, function(err, db) {
    if (err) {
      console.log(MESSAGES.SERVER_DATA_SYNC_ERROR, err);
      return cb(false);
    }

    db.collection(table, function(err, collection){
      if (err) {
        console.log(MESSAGES.SERVER_DATA_SYNC_ERROR, err);
        return cb(false);
      }

      article._id       = ObjectID(); //.toString();

      collection.insert(article, function(err, records) {
        article._id = article._id.toString();

        if (err) {
          console.log(MESSAGES.SERVER_DATA_SYNC_ERROR, err);
          return cb(false);
        }

        db.close();
        cb(true);
      });
    });
  });
};

adapter.update = function(_id, table, updateJSON, cb) {
  var dir = DATA_MODELS[table];
  cb = cb || _cb;

  if (!dir) {
    console.log(MESSAGES.SERVER_DATA_SYNC_ERROR, arguments);
    return cb(false);
  }

  MongoClient.connect(CONNECTIONSTR, function(err, db) {
    if (err) {
      console.log(MESSAGES.SERVER_DATA_SYNC_ERROR, err);
      return cb(false);
    }

    db.collection(table, function(err, collection){
      if (err) {
        console.log(MESSAGES.SERVER_DATA_SYNC_ERROR, err);
        return cb(false);
      }

      var oldId = updateJSON._id;
      delete updateJSON._id;
      collection.update({ _id: ObjectID(_id) }, { $set: updateJSON }, function(err, records) {
        if (err) {
          console.log(MESSAGES.SERVER_DATA_SYNC_ERROR, err);
          return cb(false);
        }

        oldId && (updateJSON._id = oldId);
        db.close();
        cb(true);
      });
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

  MongoClient.connect(CONNECTIONSTR, function(err, db) {
    if (err) {
      console.log(MESSAGES.SERVER_DATA_SYNC_ERROR, err);
      return cb(false);
    }

    db.collection(table, function(err, collection) {
      if (err) {
        console.log(MESSAGES.SERVER_DATA_SYNC_ERROR, err);
        return cb(false);
      }

      collection.remove({_id: ObjectID(_id)}, function(err, num) {
        if (err) {
          console.log(MESSAGES.SERVER_DATA_SYNC_ERROR, err);
        }

        db.close();
        cb(num > 0);
      });
    });
  });
};

module.exports = adapter;