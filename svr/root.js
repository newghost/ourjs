/*!@preserve
* OurJS     : Free Blog Engine, Forum System, Website Template and CMS Platform based on Node.JS
* Copyright : Kris Zhang <kris.newghost@gmail.com>
* Homepage  : http://code.ourjs.com
* Project   : https://github.com/newghost/ourjs
* License   : BSD
*/

//import namespace
var qs        = require("querystring")
  , utility   = require("./utility")
  //, UrlSlug   = require('./urlSlug')
  , app       = global.app 
  , redblade  = require('redblade')
  , User      = require('./user')
  , Article   = require('./article')


/*
/root 为维护文章功能，未登录，不可用
*/
app.use('/root', function(req, res) {
  var user = req.session.get('user')

  if (!user || !user.username) {
    res.send(401, '没有权限')
  } else {
    req.filter.next()
  }
})


app.get('/root/edit/:id', function(req, res) {
  var user  = req.session.get('user') || {}
    , id    = req.params.id

  if (id == "add") {
    res.render('edit.tmpl', { user: user, article: {} })
  } else {
    Article.getArticlesFromIDs([id], function(articles) {
      var article = articles[0]

      if (article && (!article.poster || article.poster === user.username || user.isAdmin)) {
        res.render('edit.tmpl', { user: user, article: article })
      } else {
        res.end(MESSAGES.NOPERMISSION)
      }
    })
  }
})

/*
var getPostInterval = function(userInfo) {
  if (!userInfo.username) {
    return 1000000
  }

  var curDate   = + new Date() / 1000 | 0
    , interval  = (postIntervals[userInfo.username] | 0) + GENERAL_CONFIG.postInterval - curDate


  interval < 0 && (interval = (userInfo.joinedTime / 1000 | 0) + GENERAL_CONFIG.newerInterval - curDate)

  return interval
}
*/


app.post("/root/edit.post", function(req, res) {
  var article   = req.body
    , user      = req.session.get('user')

  // if (!isEdit) {
  //   var interval = getPostInterval(user)
  //   if (interval > 0) {
  //     return res.end(MESSAGES.NEED_WAIT.format(interval))
  //   }
  // }

  if (article.title
    && (!article.poster || article.poster === user.username || user.isAdmin)) {

    //2代表草稿
    !user.isAdmin && article.isPublic !== 2 && (article.isPublic = 0)


    var onResponse = function(err, result) {
      if (err) {
        return res.end(err.toString())
      }
      
      res.redirect('/article/' + article.id)
    }


    if ( article.id ) {
      redblade.client.hget('article:' + article.id, 'poster', function(err, poster) {
        if (user.username == poster || user.isAdmin) {
          redblade.update('article', article, onResponse)
        } else {
          res.send('您没有权限')
        }
      })

      return

    } else {
      article.id        = app.newID(4)
      article.url       = utility.addTag(article.url)
      article.poster    = user.username
      article.postDate  = +new Date()
      article.visitNum  = 0

      redblade.insert('article', article, onResponse)
    }

    return
  }

  res.send('参数不完整')

}, 'qs')


app.get('/root/delete/:id', function(req, res) {
  var id        = req.params.id
    , user      = req.session.get('user')
    , key       = 'article:' + id

  redblade.client.hmget(key, 'poster', 'isPublic', function(err, article) {
    if (article) {
      if (article.isPublic == 1) {
        res.send('为防止误操作，请先取消发布再删除')
        return
      }

      if (article.poster == user.username || user.isAdmin) {
        //使用remove删除文章和相关索引
        redblade.remove('article', { id: id }, function(err, result) {
          res.send("删除" + (result ? '成功' : '失败'))
        })
        return
      }
    }

    res.send('参数错误')
  })
})

app.get('/root/publish/:id/:state', function(req, res) {
  var id        = req.params.id
    , user      = req.session.get('user')
    , state     = parseInt(req.params.state) || 0
    , key       = 'article:' + id

  redblade.client.exists(key, function(err, exists) {
    if (!exists) {
      res.send('参数错误')
      return
    }

    /*
    根据schema中的定义: { "isPublic"    : "index('public', return +new Date())" }
    使用update, 更新article 同时会自动添加id到 public:1 的集合，权重为当前的时间
    */
    redblade.update('article', { id: id, isPublic: state }, function(err, result) {
      res.send((state ? '发布' : '取消发布') + (result ? '成功' : '失败'))
    })
  })
})


app.post('/reply/add/:id', function(req, res) {
  var id          = req.params.id
    , poster      = req.session.get('username')
    , last_reply  = req.session.get('last_reply')
    , reply       = req.body
    , article     = Articles.all[id]


  if (last_reply && article && reply && (poster || reply.nickname)) {
    var interval  = last_reply + GENERAL_CONFIG.replyInterval - (new Date() / 1000 | 0)

    if ( interval > 0 ) {
      return res.end(MESSAGES.NEED_WAIT.format(interval))
    }

    poster && (reply.poster = poster)
    reply.postdate  = + new Date()

    Schema.filter('reply', reply)
    reply.reply = utility.safeHTML(reply.reply)

    article.replies
      ? (article.replies.push(reply))
      : (article.replies = [reply])

    var updateJSON = { 
        replies   : article.replies
      , replyTime : reply.postdate
    }

    adapter.update(id, 'article', updateJSON, function(result) {
      res.end(result ? '' : 'error')
      result && Articles.update(article, updateJSON)
    })

    req.session.set('last_reply', + new Date() / 1000 | 0)

  } else {
    res.end(MESSAGES.NOPERMISSION)    
  }

}, 'json')


app.get('/reply/del/:id/:idx', function(req, res) {
  var id        = req.params.id
    , idx       = req.params.idx
    , userInfo  = Users.users[req.session.get('username')]
    , article   = Articles.all[id]


  if (idx && article) {
    var reply = article.replies[idx]
    if (reply && userInfo && (userInfo.username == reply.poster || userInfo.isAdmin)) {
      reply.deleted = true

      Schema.filter('reply', reply)

      var updateJSON = { replies   : article.replies }
      adapter.update(id, 'article', updateJSON, function(result) {
        res.end(result ? '' : 'error')
        result && Articles.update(article, updateJSON)
      })
    }
  }
})