/*!@preserve
* OurJS     : Free Blog Engine, Forum System, Website Template and CMS Platform based on Node.JS
* Copyright : Kris Zhang <kris.newghost@gmail.com>
* Homepage  : http://code.ourjs.com
* Project   : https://github.com/newghost/ourjs
* License   : BSD
*/

//Database operator
var fs              = require('fs')
  , redis           = require('redis')
  , mongodb         = require('mongodb')
  , MongoClient     = mongodb.MongoClient
  , BSON            = mongodb.BSONPure
  , ObjectID        = BSON.ObjectID
  , config          = global.CONFIG
  , DATA_MODELS     = global.DATA_MODELS
  , MESSAGES        = config.MESSAGES
  , REDIS_CONFIG    = config.REDIS_CONFIG


var adapter = {}
  , _cb     = new Function()
  , client


var checkConnection = function() {

  if (client && client.connected) {
    return
  }

  var host = REDIS_CONFIG.host   || '127.0.0.1'
    , port = parseInt(REDIS_CONFIG.port) || 6379
    , opts = REDIS_CONFIG.opts   || {}
    , auth = REDIS_CONFIG.auth
    , idx  = REDIS_CONFIG.select || 0

  client = redis.createClient(port, host, opts)

  auth && client.auth(auth)

  client.select(idx, function(err, state) {
    err
      ? console.log(err)
      : console.log('Redis store is ready, using DB:', idx)
  })

  client.on('error', function (err) {
    console.error(err)
  })

  client.on('connect', function() {
    console.log('CONNECTED', arguments)
  })
}


adapter.select = function(_id, table, cb) {
  if (arguments.length < 3) {
    cb = table || _cb
    table = _id
    _id = undefined
  } else {
    cb = cb || _cb
  }

  var dir = DATA_MODELS[table]

  if (!dir) {
    console.log(MESSAGES.SERVER_DATA_SYNC_ERROR, arguments)
    return cb([])
  }

  checkConnection()

  if (_id) {
    client.get(table + ':' + _id, function(err, object) {
      if (err) {
        console.log(MESSAGES.SERVER_DATA_SYNC_ERROR, err)
        return cb([])
      }

      cb([object])
    })
  } else {
    client.keys(table + ':*', function (err, keys) {
      if (err) return console.log(err)

      var result = []

      var getByKey = function(_id) {
        client.get(table + ':' + _id, function(err, object) {
          if (err) {
            console.log(MESSAGES.SERVER_DATA_SYNC_ERROR, err)
            result.push({})
          } else {
            result.push(object)
          }

          result.length == keys.length && cb(result)
        })
      }

      keys.forEach(getByKey)
    })
  }
}

adapter.insert = function(table, article, cb) {
  var dir = DATA_MODELS[table]
  cb = cb || _cb

  if (!dir) {
    console.log(MESSAGES.SERVER_DATA_SYNC_ERROR, arguments)
    return cb(false)
  }

  checkConnection()

  !article._id && (article._id = ObjectID().toString())

  client.set(table + ':' + article._id, article,  function(err) {
    if (err) {
      console.log(MESSAGES.SERVER_DATA_SYNC_ERROR, err)
      return cb(false)
    }

    cb(true)
  })
}

adapter.update = function(_id, table, updateJSON, cb) {
  var hasID = !!updateJSON._id
  updateJSON._id = _id

  adapter.insert(table, updateJSON, function(result) {
    if (!hasID) {
      delete updateJSON._id
    }

    cb(result)
  })
}

adapter.delete = function(_id, table, cb) {
  var dir = DATA_MODELS[table]
  cb = cb || _cb

  if (!dir) {
    console.log(MESSAGES.SERVER_DATA_SYNC_ERROR, arguments)
    return cb(false)
  }

  checkConnection()

  client.del(table + ':' + _id, function(err) {
    if (err) {
      return cb(false)
    }

    cb(true)
  })
}

module.exports = adapter