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
  // , events          = require('events')
  , utility         = require('./utility')
  , config          = global.CONFIG


// var list              = []    //all list order with publish date
//   , replyList         = []    //all list order with reply date
//   , all               = {}    //all key/value pair
//   , categoryArticles  = {}    //all displayed in default page
//   , keywordsArticles  = {}    //filter articles by keywords
//   , urlSlugsArticles  = {}    //sort articles by url slugs
//   , userArticles      = {}
//   , refreshTimer      = 0


var User      = require('./user')
  , redblade  = require('redblade')


// var notify = new events.EventEmitter()

/*
Get and init articles
*/
// var initArticles  = function() {
//   adapter.select('article', function(records) {
//     //reset category of articles but keep the reference of array object
//     for (var id in all) {
//       delete all[id]
//     }

//     //update article pool
//     records.forEach(function(article) {
//       var id = article._id.toString()
//       formatArticle(article)
//       all[id] = article
//     })

//     refreshPool()

//     console.log('Refreshed articles ', records.length)

//     notify.emit('done')
//   })
// }

/*
Format article for outputing/displaying
*/
// var formatArticle = function(article) {
//   article.poster        = article.poster || 'ourjs'
//   article.avatar        = (Users.users[article.poster] || {}).avatar
//   //category articles will be displayed on homepage, verified articles
//   article.postdatetime  = utility.getTimestampFromDate(article.publishTime || article.postdate)
//   article.category      = article.category  || ""
//   article.keyword       = article.keyword   || ''

//   if (article.replies) {
//     for (var i = 0, l = article.replies.length; i < l; i++) {
//       var reply = article.replies[i]
//       reply.avatar = (Users.users[reply.poster] || {}).avatar
//     }
//   }
// }

/*
Refresh cached pool
*/
// var refreshPool = function() {
//   var idx
//     , len


//   /*
//   * clean first
//   */
//   //list.splice(0, list.length)
//   list.length       = 0
//   replyList.length  = 0

//   for (idx in urlSlugsArticles) {
//     delete urlSlugsArticles[idx]
//   }

//   for (idx in categoryArticles) {
//     delete categoryArticles[idx]
//   }

//   for (idx in keywordsArticles) {
//     delete keywordsArticles[idx]
//   }

//   for (idx in userArticles) {
//     delete userArticles[idx]
//   }

//   /*
//   * init
//   */
//   categoryArticles['']  = []
//   keywordsArticles['']  = []

//   for (var _id in all) {
//     var article = all[_id]
//     if (article && article.postdate && article.title) {
//       article.urlSlug && (urlSlugsArticles[article.urlSlug] = article)
//       list.push(article)
//       replyList.push(article)
//     }
//   }

//   list.sort(function(articleA, articleB) {
//     return (articleB.publishTime || articleB.postdate) - (articleA.publishTime || articleA.postdate)
//   })

//   replyList.sort(function(articleA, articleB) {
//     return (articleB.replyTime || articleB.postdate) - (articleA.replyTime || articleA.postdate)
//   })

//   /*
//   * update pool (category & users)
//   */
//   for (idx = 0, len = list.length; idx < len; idx++) {

//     var article   = list[idx]

//     if (article) {

//       var category  = article.category
//         , poster    = article.poster


//       //user articles doesn't need to be verified
//       if (poster) {
//         !userArticles[poster] && (userArticles[poster] = [])
//         userArticles[poster].push(article)
//       }

//       if (article.verify == 1) {
//         if (category && category != '') {
//           !categoryArticles[category] && (categoryArticles[category] = [])
//           categoryArticles[category].push(article)
//         } 
//         categoryArticles[''].push(article)
//       }
//     } else {
//       console.log(article, idx, len)
//     }
//   }

//   /*
//   * update reply list pool (category & users)
//   */
//   for (idx = 0, len = replyList.length; idx < len; idx++) {
//     var article   = replyList[idx]
//     if (article) {
//       var keyword   = article.keyword
//       //hidden or delete articles will not displayed here
//       if (article.verify >= 0) {
//         if (keyword) {
//           !keywordsArticles[keyword] && (keywordsArticles[keyword] = [])
//           keywordsArticles[keyword].push(article)
//         }
//         keywordsArticles[''].push(article)
//       }
//     }
//   }

//   console.log('refreshed cache pool!')
// }

// var update = function(article, updateJSON) {
//   var _id = article._id
//   if (_id) {
//     if (updateJSON) {
//       for (var key in updateJSON) {
//         article[key] = updateJSON[key]
//       }
//     }

//     formatArticle(article)

//     all[_id] = article
//     refreshPool()
//     return true
//   }
//   return false
// }

// var remove = function(article) {
//   var id = article._id

//   if (id) {
//     delete all[id]
//     refreshPool()
//     return true
//   }
//   return false
// }

// var find = function(urlId) {
//   return all[urlId] || urlSlugsArticles[urlId] || null
// }

// var findSimilar = function(article) {
//   var allSimilar = categoryArticles[article.category] || []

//   return allSimilar.slice(0, 10).map(function(article) {
//     return {
//         _id:   (article._id || '').toString()
//       , title: article.title
//     }
//   })
// }

// var getTitleFromIDs = function(ids, len) {
//   ids = ids || []
//   len = len || 10 

//   var result = []
//   for (var i = 0, l = ids.length; i < ids.length && result.length < len; i++) {
//     var article = all[ids[i]]
//     if (article && article.title && article.verify != 0) {
//       result.push({
//           _id:   ids[i]
//         , title: article.title
//       })
//     }
//   }
//   return result
// }

// var refresh = function() {
//   clearTimeout(refreshTimer) //cancel the last refresh within 2 seconds
//   refreshTimer = setTimeout(initArticles, 2000)
// }


var getArticlesFromIDs = function(IDs, cb) {
  var count     = 0
    , articles  = []

  var getArticleFromID = function(id) {
    redblade.client.hgetall('article:' + id, function(err, article) {
      if (!err) {
        articles.push(article)
      }

      ++count == IDs.length && cb && cb(articles)
    })
  }

  IDs && IDs.length
    ? IDs.forEach(getArticleFromID)
    : cb && cb(articles)
}

/*
提取已经发布的文章
*/
var getArticles = function(start, end, cb, keyword) {
  var where = { isPublic: 1 }

  keyword && (where.keyword = keyword)

  redblade.select('article', where, function(err, articles) {
  //redblade.client.zrange('public:1', start, end, function(err, articleIDs) {
    if (!err) {
      //getArticlesFromIDs(articleIDs, cb)
      cb && cb(articles)
    } else {
      cb && cb([])
    }
  })
}


module.exports = {
    getArticlesFromIDs  : getArticlesFromIDs
  , getArticles         : getArticles
}