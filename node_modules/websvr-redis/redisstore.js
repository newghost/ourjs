/*
* Description:  Session stored in redis for websvr
* Author:       Kris Zhang
* Licenses:     MIT
* Project url:  https://github.com/newghost/redisstore
*/

var RedisStore = module.exports = function(client) {

  var schema = 'session:'

  var del = function(key, cb) {
    console.log('del key', key)
    client.del(schema + key, cb)
  }

  var set = function(key, object, cb) {
    !client.connected && start()
    client.hmset(schema + key, object, function(err) {
      cb && cb(err)
    })
  }

  var get = function(key, cb) {
    !client.connected && start()
    client.hgetall(schema + key, function(err, object) {
      cb && cb(object || {})
    })
  }

  //Delete these sessions that created long long ago (1 day)
  var expire = 24 * 3600 * 1000

  var isExpired = function(key) {
    var idx  = key.indexOf('-')

    if (key.length == 25 && idx > 0) {
      client.hget(schema + key, '__lastAccessTime', function(err, __lastAccessTime) {
        if (err) {
          del(key)
          return
        }
        cb && cb(err, data)
        var isValid = __lastAccessTime && (+new Date() - __lastAccessTime <= sessionTimeout)
        !isValid && del(key)
      })
    }
  }

  /*
  Clear the expired session
  */
  var clear = function() {
    //default is 24 hours
    var sessionTimeout = options.sessionTimeout || 24 * 3600 * 1000

    client.keys(schema + '*', function (err, keys) {
      if (err) return console.log(err)

      keys.forEach(isExpired)
    })
  }

  var self = {
      get     : get
    , set     : set
    , del     : del
    , clear   : clear
  }


  Object.defineProperty(self, 'schema', {
    get: function() {
      return schema
    },
    set: function(_schema) {
      schema = _schema
    }
  })


  return self
};