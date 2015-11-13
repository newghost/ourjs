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

/*
在ourjs.js中 require('root') 在 app.uss(function() { }) 之前
root的middleware比ourjs.js的middleware执行要早，
所以session此时未定义； 添加解析session的参数
*/
}, { session: true })  


app.get('/root/edit/:id', function(req, res) {
  var user  = req.session.get('user') || {}
    , id    = req.params.id

  redblade.client.smembers('key', function(err, keywords) {
    if (id == "add") {
      res.render('edit.tmpl', { user: user, article: {}, keywords: keywords })
    } else {
      redblade.client.hgetall('article:' + id, function(err, article) {
        /*
        keyword为关键词索引，redblade会自动将所有关词诩都保存到 key 集合中
        提取出来为自动补全控件使用
        */
        if (article && (article.poster === user.username || user.isAdmin)) {
          res.render('edit.tmpl', { user: user, article: article, keywords: keywords })
        } else {
          res.end(MESSAGES.NOPERMISSION)
        }
      })
    }
  })

})


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

    //只有管理员可设此值
    delete article.isPublic
    /*
    此前端会发过来的关键字是这样的，需要整理一下;
    keyword[]:java  keyword[]:c#
    keyword[] = [ java, c# ]
    keyword 以豆号分割
    */
    var keyword = article['keyword[]']
    if (keyword) {
      //两个就是数组，只有一个即为字符串
      article.keyword = keyword.join
        ? keyword.join(',')
        : keyword.toString()
    }
    

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
      article.postTime  = +new Date()
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

  redblade.client.hmget(key, 'poster', 'isPublic', function(err, result) {
    result = result || []

    var poster    = result[0]
      , isPublic  = result[1]

    if (poster != user.username && !user.isAdmin) {
      return res.send('您没有权限')
    }

    if (isPublic == 1) {
      return res.send('为防止误操作，请先取消发布再删除')
    }

    //使用remove删除文章和相关索引
    redblade.remove('article', { id: id }, function(err, result) {
      res.send("删除" + (result ? '成功' : '失败'))
    })
  })
})

app.get('/root/publish/:id/:state', function(req, res) {
  var id        = req.params.id
    , user      = req.session.get('user')
    , state     = parseInt(req.params.state) || 0
    , key       = 'article:' + id

  if (!user.isAdmin) {
    res.send('没有权限')
    return
  }

  redblade.client.exists(key, function(err, exists) {
    if (!exists) {
      res.send('参数错误')
      return
    }

    /*
    根据schema中的定义: { "isPublic"    : "index('public', return this.pubTime)" }
    使用update, 更新article 同时会自动添加id到 public:1 的集合，权重为当前的时间(pubTime整型)
    */
    redblade.update('article', { id: id, isPublic: state, pubTime: +new Date() }, function(err, result) {
      res.send((state ? '发布' : '取消发布') + (result ? '成功' : '失败'))
    })
  })
})
