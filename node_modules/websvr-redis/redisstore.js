/*
* Description:  Session stored in redis for websvr
* Author:       Kris Zhang
* Licenses:     MIT
* Project url:  https://github.com/newghost/redisstore
*/

var RedisStore = module.exports = function(client, sessionTimeout) {

  var schema = 'session:'

  //default 1 hour
  sessionTimeout = sessionTimeout || 60 * 60

  var del = function(key, cb) {
    client.del(schema + key, cb)
  }

  var set = function(key, object, cb) {
    var sessionKey = schema + key
    client.set(sessionKey, JSON.stringify(object || {}), function(err) {
      client.expire(sessionKey, sessionTimeout)
      cb && cb(err)
    })
  }

  var get = function(key, cb) {
    client.get(schema + key, function(err, data) {
      var object = {}
      try {
        object = JSON.parse(data)
      } catch(err) {
        console.error('session parse error ' + key + '@' + err)
      }
      cb && cb(object)
    })
  }



  var self = {
      get     : get
    , set     : set
    , del     : del
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