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
  , app             = global.app


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


var signHandler = function(req, res, userInfo) {
  if (userInfo && userInfo.username)  {
    req.session.set('username', userInfo.username)

    if (req.body.autosign === 'on') {
      setAutoSignin(req, res, userInfo)
    }

    req.url.indexOf('redirect') < 0
      ? res.send({username: userInfo.username, avatar: userInfo.avatar})
      : res.redirect('/')

    return true
  }

  req.url.indexOf('redirect') < 0 && res.send({})
  res.send(
    req.url.indexOf('signin') > 0
      ? MESSAGES.USERNAME_PASSWORD_NOT_MATCH
      : MESSAGES.DUPLICATED
  )

  return false
}





app.get('/useredit/:username', function(req, res) {
  var username  = req.params.username
    , user      = req.session.get('user') || {}

  redblade.client.hgetall('user:' + username, function(err, userInfo) {
    if (userInfo && (userInfo.username == user.username || user.isAdmin)) {
      return res.render('useredit.tmpl', {
        userInfo : userInfo
      })
    }

    res.send('参数错误')
  })

})


/*
App Handlers here
*/
app.post('/user.signup.post', function(req, res) {
  var postInfo = req.body
    , userInfo = {
        username: postInfo.username
      , password: postInfo.password
      , email:    postInfo.email
    }

  signup(userInfo, function(err) {
    if (err) {
      res.send({ error: err.toString() })
      return
    }

    signHandler(req, res, userInfo)
  })
}, 'qs')

app.get('/user.signin.post', function(req, res) {
  var userInfo = req.body
  signin(userInfo, function(signedUser) {
    signedUser
      ? signHandler(req, res, signedUser)
      : res.send({ error: '登录失败' })
  })
}, 'qs')

/*
* user.edit.post: response json
*/
app.post('/user.edit.post', function(req, res) {
  var userInfo  = req.body
    , user      = req.session.get('user')

  //密码加密后再比较
  userInfo.password = utility.getEncryption(userInfo.password || '')

  if ((userInfo && userInfo.username && userInfo.username == user.username && userInfo.password == user.password) || user.isAdmin) {

    var newPassword = userInfo.newPassword
    if (newPassword) {
      userInfo.password = utility.getEncryption(newPassword)
    }

    redblade.update('user', userInfo, function(err, done) {
      if (req.url.indexOf('redirect') < 0) {
        res.send({ done: done })
      } else {
        done
          ? res.redirect('/')
          : res.send({ error: (err || '更新失败').toString() })
      }
    })
  } else {
    res.send({ error: '参数错误' })
  }

}, 'qs')

app.get('/user.signout.post', function(req, res) {
  var username = req.session.get('username')
    , opts     = { path: '/', domain: WEBSVR_CONFIG.sessionDomain, httponly: true }

  //清空user
  req.session.set('user', '')
  res.cookie('t0', null, opts)
  res.cookie('t1', null, opts)
  res.cookie('t2', null, opts)
  req.url.indexOf('redirect') < 0
    ? res.send({done: true})
    : res.redirect('/')
})


/*
userInfo: get userInfo and he articles
*/
app.get('/user/:username/:pageNumber', function(req, res) {
  var url       = req.url
    , params    = req.params
    , username  = params.username || ''

  /*
  Get parameters: filter category
  url: '/user/ourjs/0'
  */
  var tmpl        = url.split('/')[1] || 'user'
    , pageNumber  = params.pageNumber || 0
    , nextNumber  = pageNumber + 1
    , pageSize    = 100

  if (username) {
    redblade.client.hgetall('user:' + username, function(err, userInfo) {
      if (!userInfo) {
        res.send('用户不存在')
        return
      }

      redblade.select('article', { poster: username }, function(err, articles) {
        res.render(tmpl + ".tmpl", {
            articles  : articles
          , userInfo  : userInfo
          , nextPage  : nextNumber
        })
      })
    })
  } else {
    res.end()
  }
})









module.exports = {
    getAutoSignin : getAutoSignin
  , setAutoSignin : setAutoSignin
  , getUser       : getUser
  , signup        : signup
  , signin        : signin
  , update        : update
}