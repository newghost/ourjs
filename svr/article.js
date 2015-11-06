/*!@preserve
* OurJS     : Free Blog Engine, Forum System, Website Template and CMS Platform based on Node.JS
* Copyright : Kris Zhang <kris.newghost@gmail.com>
* Homepage  : http://code.ourjs.com
* Project   : https://github.com/newghost/ourjs
* License   : BSD
*/

/*
Cache articles for sites
*/
var fs              = require('fs')
  , path            = require('path')
  , utility         = require('./utility')
  , config          = global.CONFIG


var redblade  = require('redblade')





//handle: /templatename/category/pagenumber, etc: /home/all/0, /home, /json/all/0
var showListHandler = function(req, res, url) {
  var params      = app.parseUrl('/:template/:keyword/:pagerNumber', url || req.url)
    , template    = params.template || 'home'
    , keyword     = params.keyword  || ''
    , pageNumber  = parseInt(params.pagerNumber) || 0
    , pageSize    = 40
    , user        = req.session.get('user') || {}


  var where = { isPublic: 1 }

  keyword && (where.keyword = keyword)

  redblade.select('article', where, function(err, articles) {
    if (err) {
      res.send(err.toString())
      return
    }

    template.indexOf('rss') > -1 && res.type('xml')
    res.render(template + ".tmpl", {
        articles  : articles
      , keyword   : keyword
      , nextPage  : '/' + template + '/' + keyword + '/' + (pageNumber + 1)
    })

  }, { from: pageNumber * pageSize, to: (pageNumber + 1) * pageSize })
}


//handle detail.tmpl: content of article
var showDetailHandler = function(req, res) {
  var tmpl  = req.url.split('/')[1]     //get the template name
    , id    = req.params.id             //get the object id
    , key   = 'article:' + id
    , user  = req.session.get('user') || {}

  if (id && tmpl) {
    //Does it existing in the Articles?
    redblade.client.hgetall(key, function(err, article) {
      if (article) {
        redblade.client.hincrby(key, 'visitNum', 1)
        redblade.client.hgetall('user:' + article.poster, function(err, posterInfo) {
          res.render(tmpl + ".tmpl", {
              article : article
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


//127.0.0.1/ or 127.0.0.1/home/category/pagernumber
app.get(['/home', '/json', '/rss'], showListHandler)

//127.0.0.1/article/2340234erer23343[OjbectID]
app.get('/article/:id', showDetailHandler)




module.exports = {
    showListHandler : showListHandler
}