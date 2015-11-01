/*!@preserve
* OurJS     : Free Blog Engine, Forum System, Website Template and CMS Platform based on Node.JS
* Copyright : Kris Zhang <kris.newghost@gmail.com>
* Homepage  : http://code.ourjs.com
* Project   : https://github.com/newghost/ourjs
* License   : BSD
*/

//import namespace
var fs          = require('fs')
  , http        = require('http')
  , path        = require('path')
  , qs          = require('querystring')
  , WebSvr      = require('websvr')
  , RedisStore  = require('websvr-redis')
  , redis       = require('redis')
  , redblade    = require('redblade')
  , client
  , config      = global.CONFIG = require(path.join('../', process.argv[2]))


var User    = require('./user')
  , Article = require('./article')
  , utility = require('./utility')


/*
* js library used for both front-end and back-end
*/
require('../lib/string.js')()


var WEBSVR_CONFIG   = config.WEBSVR_CONFIG
  , MESSAGES        = config.MESSAGES
  , REDIS_CONFIG    = config.REDIS_CONFIG



//Start the WebSvr
var app = WebSvr(WEBSVR_CONFIG)

//Set default model
app.model({ user:{} })

//change template engine
//app.engine(require("./doT").compile)



/*
对所有请求均自动解析并附加session方法
*/
app.use(function(req, res) {
  var url       = req.url
    , user      = req.session.get('user') || {}
    , cookies   = req.cookies

  var handleNext = function(userInfo) {
    //if root dir redirect to home, etc /, /?abc=1234
    if (url == '/' || url[1] == '?') {
      showListHandler(req, res, "/home/")
    } else {
      req.filter.next()
    }
  }

  //未登录且有自动登录的cookie
  if (!user.username && cookies.t0) {
    User.getAutoSignin(cookies, function(userInfo) {
      req.session.set('user', userInfo || {})
      handleNext()
    })
  } else {
    handleNext()
  }

}, { session: true })

//handle: /templatename/category/pagenumber, etc: /home/all/0, /home, /json/all/0
var showListHandler = function(req, res, url) {
  var params      = app.parseUrl('/:template/:keyword/:pagerNumber', url || req.url)
    , template    = params.template || 'home'
    , keyword     = params.keyword  || 'all'
    , pageNumber  = parseInt(params.pagerNumber) || 0
    , pageSize    = 40
    , user        = req.session.get('user') || {}


  Article.getArticles(pageNumber * pageSize, (pageNumber + 1) * pageSize, function(articles) {
    template.indexOf('rss') > -1 && res.type('xml')

    res.render(template + ".tmpl", {
        user      : user
      , articles  : articles
      , keyword   : keyword
      , nextPage  : '/' + template + '/' + keyword + '/' + (pageNumber + 1)
    })
  })
}

//127.0.0.1/ or 127.0.0.1/home/category/pagernumber
app.get(['/home', '/json', '/rss'], showListHandler)

//handle detail.tmpl: content of article
var showDetailHandler = function(req, res) {
  var tmpl  = req.url.split('/')[1]     //get the template name
    , id    = req.params.id             //get the object id
    , key   = 'article:' + id


  if (id && tmpl) {
    //Does it existing in the Articles?
    client.hgetall(key, function(err, article) {
      if (article) {
        client.hincrby(key, 'visitNum', 1)
        client.hgetall('user:' + article.poster, function(err, posterInfo) {
          res.render(tmpl + ".tmpl", {
              article : article
            , user    : req.session.get('user')
            , poster  : posterInfo || {}
          })
        })
      } else {
        res.write404()
      }
    })
  } else {
    res.write404()
  }
}

//127.0.0.1/article/2340234erer23343[OjbectID]
app.get('/article/:id', showDetailHandler)



app.get('/useredit/:username', function(req, res) {
  var username  = req.params.username
    , loginUser = req.session.get('username')


  if (username == loginUser || (Users.users[loginUser] || {}).isAdmin) {
    var userInfo = Users.users[username]
    if (userInfo) {
      if (userInfo._id) {
        return res.render('useredit.tmpl', {
            user:     userInfo
          , username: loginUser
        })
      } else {
        //User didn't registed in this system but have shared session
        res.end('You cannot edit profile here!')
      }
    }
  }
  res.send(MESSAGES.NOPERMISSION)
})

var signHandler = function(req, res, userInfo) {
  if (userInfo && userInfo.username)  {
    req.session.set('username', userInfo.username)

    if (req.body.autosign === 'on') {
      User.setAutoSignin(req, res, userInfo)
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

app.post('/user.signup.post', function(req, res) {
  var postInfo = req.body
    , userInfo = {
        username: postInfo.username
      , password: postInfo.password
      , email:    postInfo.email
    }

  User.signup(userInfo, function(err) {
    if (err) {
      res.send({ error: err.toString() })
      return
    }

    signHandler(req, res, userInfo)
  })
}, 'qs')

app.get('/user.signin.post', function(req, res) {
  var userInfo = req.body
  User.signin(userInfo, function(signedUser) {
    signedUser
      ? signHandler(req, res, signedUser)
      : res.send({ error: '登录失败' })
  })
}, 'qs')

/*
* user.edit.post: response json
*/
app.post('/user.edit.post', function(req, res) {
  var postInfo  = req.body
    , loginUser = Users.users[req.session.get('username')]

  if (loginUser && loginUser._id) {
    utility.extend(postInfo, {
        _id           : loginUser._id
      , username      : loginUser.isAdmin ? postInfo.username : loginUser.username
    })

    Users.update(postInfo, function(done) {
      if (req.url.indexOf('redirect') < 0) {
        res.send({done:done})
      } else {
        done
          ? res.redirect('/')
          : res.send(MESSAGES.USERNAME_PASSWORD_NOT_MATCH)
      }
    })
  } else {
    res.end(MESSAGES.TIMEOUT)
  }

}, 'qs')

app.get('/user.signout.post', function(req, res) {
  var username = req.session.get('username')
    , opts     = { path: '/', domain: WEBSVR_CONFIG.sessionDomain, httponly: true }

  req.session.set('username', '')
  res.cookie('autosign', null, opts)
  res.cookie('_id', null, opts)
  res.cookie('token', null, opts)
  req.url.indexOf('redirect') < 0
    ? res.send({done: true})
    : res.redirect('/')
})


var getPagination = function(config, pagerFormat) {
  var interval = 5
    , curPager = config.pager || 0
    , maxPager = config.count / config.pageSize | 0
    , startPos = curPager - (interval / 2 | 0)


  maxPager - startPos < interval && (startPos = maxPager - interval)
  startPos < 1 && (startPos = 1)

  var pagination  = ''
    , paginations = []


  var addPage = function(pager) {
    paginations.push(
      pagerFormat.format(pager, curPager == pager ? 'class="active"' : '')
    )
  }

  addPage(0)
  startPos > 1 && paginations.push('<li><a>…</a></li>')
  for (var i = 0; startPos < maxPager && i < 5; i++, startPos++) {
    addPage(startPos)
  }
  startPos < maxPager && paginations.push('<li><a>…</a></li>')
  maxPager > 0 && addPage(maxPager)

  pagination = '<ul class="len{0}" style="table-layout:fixed">{1}</ul>'.format(paginations.length, paginations.join(''))

  return pagination
}

/*
BBS Club Handler
handle: /bbs, /bbs/nodejs, /bbs/招聘/0
page number start from 0
*/
var keyListHandler = function(req, res, url) {

  var params      = url ? app.parseUrl('/:keymeta/:keyword/:pageNumber', url) : req.params
    , keymeta     = req.url.split('/')[1] || ''
    , keyword     = params.keyword || ''
    , pageNumber  = parseInt(params.pageNumber) || 0
    , username    = req.session.get('username')
    , userInfo    = Users.users[req.session.get('username')] || {}
    , allArticles = Articles.keywordsArticles[keyword] || []
    , count       = allArticles.length
    , pageSize    = 20
    , articles    = allArticles.slice(pageNumber * pageSize, (pageNumber + 1) * pageSize)


  var config = {
      keyword:  keyword
    , keymeta:  keymeta
    , pageSize: pageSize
    , count:    count
    , pager:    pageNumber
    , username: userInfo.username
  }

  keymeta.indexOf('rss') > -1 && res.type('xml')

  res.render("{0}.tmpl".format(keymeta), {
      articles    : articles
    , title       : keywords[keyword] || keywords['']
    , username    : userInfo.username
    , useravatar  : userInfo.avatar
    , keymeta     : keymeta
    , config      : JSON.stringify(config)
    , user        : userInfo
    , hottest     : articlesCount.hottest
    , keywords    : keywords
    , pagination  : getPagination(config, '<li {1}><a href="/' + keymeta + '/' + keyword + '/{0}">{0}</a></li>')
  })
}

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
          , user      : userInfo
          , nextPage  : nextNumber
        })
      })
    })
  } else {
    res.end()
  }
})


/*
* Init
*/
;(function() {
  global.app = global.webSvr = app

  client = redis.createClient(REDIS_CONFIG)
  client.select(REDIS_CONFIG.select)

  redblade.init({ schema: './schema', client: client }, function(err) {
    var redisstore = RedisStore(client, WEBSVR_CONFIG.sessionTimeout)
    app.sessionStore = redisstore

    //addons
    require('./root')
    require('../admin/plugins')
  })
})()