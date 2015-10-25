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
var webSvr  = WebSvr(WEBSVR_CONFIG)


/*
webSvr.engine(require("./doT").compile)

//Default model of webSvr, for header/footer
var model = {}
webSvr.model(model)
*/

/*
对所有请求均自动解析并附加session方法
*/
webSvr.session(function(req, res) {
  var url       = req.url
    , username  = req.session.get('username')
    , cookies   = req.cookies


  var handleNext = function() {
    //if root dir redirect to home, etc /, /?abc=1234
    if (url == '/' || url[1] == '?') {
      showListHandler(req, res, "/home/")
    } else {
      req.filter.next()
    }
  }

  //自动登录
  if (!username && cookies.t0) {
    User.getAutoSignin(cookies, function(signedUser) {
      signedUser && req.session.set('username', signedUser.username)
      handleNext()
    })
  } else {
    handleNext()
  }
})

//handle: /templatename/category/pagenumber, etc: /home/all/0, /home, /json/all/0
var showListHandler = function(req, res, url) {
  var params      = webSvr.parseUrl('/:template/:keyword/:pagerNumber', url || req.url)
    , template    = params.template || 'home'
    , keyword     = params.keyword  || 'all'
    , pageNumber  = parseInt(params.pagerNumber) || 0
    , pageSize    = 40

  Article.getArticles(pageNumber * pageSize, (pageNumber + 1) * pageSize, function(articles) {
    if (template == 'json') {
      //render json page: remove contents in the article list
      var shortArticles = []
      articles.forEach(function(article) {
        shortArticles.push({
            id        : article.id
          , url       : article.url
          , author    : article.poster
          , title     : article.title
          , summary   : article.summary
          , content   : article.content ? 1 : 0
          , postDate  : article.postDate
          , replyNum  : 0
        })
      })
      res.send(shortArticles)
    } else {
      var user = User.getUser(req.session.get('username')) || {}

      template.indexOf('rss') > -1 && res.type('xml')

      res.render(template + ".tmpl", {
          user      : user
        , articles  : articles
        , keywords  : []
        , nextPage  : '/' + template + '/' + keyword + '/' + (pageNumber + 1)
      })
    }
  })
}

//127.0.0.1/ or 127.0.0.1/home/category/pagernumber
webSvr.url('/home', showListHandler)

//handle detail.tmpl: content of article
var showDetailHandler = function(req, res) {
  var tmpl  = req.url.split('/')[1]     //get the template name
    , id    = req.params.id             //get the object id


  if (id && tmpl) {
    //Does it existing in the Articles?
    var article = Articles.find(id)

    var display = function(article) {
      //count the article
      articlesCount.add(article._id)

      var loginUser = Users.users[req.session.get('username')] || {}

      res.render(tmpl + ".tmpl", {
          article : article
        , user    : userInfo
        , poster  : posterInfo
      })
    }

    if (article) {
      display(article)
    } else {
      res.end()
    }
  } else {
    res.end()
  }
}

//127.0.0.1/detail/2340234erer23343[OjbectID]
webSvr.url('/article/:id', showDetailHandler)


//clear template cache
webSvr.url('/clear', function(req, res) {
  var username = req.session.get('username')

  if ((Users.users[username] || {}).isAdmin) {
    webSvr.clear()
    res.end('done')
  } else {
    res.send(401, MESSAGES.NOPERMISSION)
  }
})


webSvr.url('/useredit/:username', function(req, res) {
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

    if (req.cookies.autosign || req.body.autosign === 'on') {
      var date = new Date(+new Date() + 365 * 24 * 3600 * 1000)
        , opts = { path: '/', expires: date, domain: WEBSVR_CONFIG.sessionDomain, httponly: true }


      res.cookie('autosign', userInfo.username, opts)
      res.cookie('_id', userInfo._id, opts)
      res.cookie('token', utility.getEncryption(userInfo.email), opts)
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

webSvr.url('/user.signup.post', function(req, res) {
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

webSvr.url('/user.signin.post', function(req, res) {
  var userInfo = req.body
  var signedUser = Users.signin(userInfo)
  signHandler(req, res, signedUser)
}, 'qs')

/*
* user.edit.post: response json
*/
webSvr.url('/user.edit.post', function(req, res) {
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

webSvr.url('/user.signout.post', function(req, res) {
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

  var params      = url ? webSvr.parseUrl('/:keymeta/:keyword/:pageNumber', url) : req.params
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
userinfo: get userinfo and he articles
*/
webSvr.url('/u/:username', function(req, res) {
  var url     = req.url
    , params  = req.params

  /*
  Get parameters: filter category
  url: '/userinfo/ourjs/0'
  */
  var tmpl        = req.url.split('/')[1] || 'userinfo'
    , userid      = params.userid     || 'ourjs'
    , pageNumber  = params.pageNumber || 0
    , nextNumber  = pageNumber + 1
    , articles    = (Articles.userArticles[userid] || []).slice(pageNumber * pageSize, nextNumber * pageSize)


  articles.length < pageSize && (nextNumber = 0)

  if (tmpl == 'userjson') {
    var shortArticles = []
    articles.forEach(function(article) {
      shortArticles.push({
          id: article._id
        , url: article.url
        , author:   article.poster
        , title:    article.title
        , summary:  article.summary
        , content:  article.content ? 1 : 0
        , postdate: article.postdatetime
        , keyword:  article.keyword
        , replyNum: (article.replies || '').length
      })
    })
    res.send(shortArticles)
  } else {
    res.render(tmpl + ".tmpl", {
        list:     articles
      , user:     Users.users[userid] || {}
      , next:     nextNumber
      , conf:     JSON.stringify({ pageSize: pageSize })
      , username: req.session.get('username')
    })
  }
})


/*
* Init
*/
;(function() {
  global.webSvr = webSvr

  var client = redis.createClient(REDIS_CONFIG)

  client.select(REDIS_CONFIG.select)

  redblade.init({ schema: './schema', client: client }, function(err) {
    var redisstore = RedisStore(client, WEBSVR_CONFIG.sessionTimeout)
    webSvr.sessionStore = redisstore
  })
})()