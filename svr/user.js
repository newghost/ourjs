/*!@preserve
* OurJS     : Free Blog Engine, Forum System, Website Template and CMS Platform based on Node.JS
* Copyright : Kris Zhang <kris.newghost@gmail.com>
* Homepage  : http://code.ourjs.com
* Project   : https://github.com/newghost/ourjs
* License   : BSD
*/

/*
* Users Cache
*/
var fs              = require('fs')
  , utility         = require('./utility')
  , WEBSVR_CONFIG   = require('../config').WEBSVR_CONFIG
  , redblade        = require('redblade')


var setAutoSignin = function(req, res, userInfo) {
  var date = new Date(+new Date() + 365 * 24 * 3600 * 1000)
    , opts = { path: '/', expires: date, httponly: true }

  WEBSVR_CONFIG.sessionDomain && (opts.domain = WEBSVR_CONFIG.sessionDomain)

  res.cookie('t0', userInfo.username, opts)
  res.cookie('t1', utility.getEncryption(userInfo.email, WEBSVR_CONFIG.AUTOSIGN_TOKEN), opts)
  res.cookie('t2', utility.getEncryption(userInfo.joinedTime, WEBSVR_CONFIG.AUTOSIGN_TOKEN), opts)
}

var getAutoSignin = function(cookieInfo, cb) {
  if (cookieInfo.t0 && cookieInfo.t1 && cookieInfo.t2) {
    redblade.client.hgetall('user:' + cookieInfo.t0, function(err, userInfo) {
      if (!err && userInfo) {
        var t1 = utility.getEncryption(userInfo.email, WEBSVR_CONFIG.AUTOSIGN_TOKEN)
          , t2 = utility.getEncryption(userInfo.joinedTime, WEBSVR_CONFIG.AUTOSIGN_TOKEN)

        if (cookieInfo.t1 == t1 && cookieInfo.t2 == t2) {
          cb && cb(userInfo)
        }
      } else {
        cb && cb()
      }
    })
  } else {
    cb && cb() 
  }
}

var getUser = function(username, cb) {
  redblade.client.hgetall('user:' + username, function(err, userInfo) {
    if (!err && userInfo) {
      cb && cb(userInfo)
    } else {
      cb && cb()
    }
  })
}

var signup = function(userInfo, cb) {
  userInfo.password && (userInfo.password = utility.getEncryption(userInfo.password))
  userInfo.joinedTime = +new Date()

  redblade.insert('user', userInfo, function(err, result) {
    if (err) {
      cb && cb(err)
      return
    }

    cb && cb()
  })
}

var signin = function(signinUser, cb) {
  if (signinUser.username && signinUser.password) {
    redblade.client.hgetall('user:' + signinUser.username, function(err, userInfo) {
      if (userInfo && userInfo.password === utility.getEncryption(signinUser.password)) {
        cb && cb(userInfo)
        return
      }
      cb && cb()
    })
  } else {
    cb && cb()
  }
}

var update = function(userInfo, cb) {
  if ( userInfo._id
    && userInfo.username
    && userInfo.username.length > 3
    && userInfo.password
    && users[userInfo.username]
    ) {

    userInfo.password = utility.getEncryption(userInfo.password)

    if (users[userInfo.username].password !== userInfo.password) {
      return cb && cb(false)
    }

    if (userInfo.newPassword && userInfo.confPassword === userInfo.newPassword ) {
      userInfo.password = utility.getEncryption(userInfo.newPassword)
    }

    Schema.filter('user', userInfo)

    adapter.update(userInfo._id, 'user', userInfo, function(done) {
      //Update cache
      if (done) {
        !usersEmail[userInfo.email] && (usersEmail[userInfo.email] = users[userInfo.username])
        utility.extend(users[userInfo.username], userInfo)
        utility.extend(usersEmail[userInfo.email], userInfo)
      }
      return cb && cb(done)
    })

  } else {
    return cb && cb(false)
  }
}

module.exports = {
    getAutoSignin : getAutoSignin
  , setAutoSignin : setAutoSignin
  , getUser       : getUser
  , signup        : signup
  , signin        : signin
  , update        : update
}