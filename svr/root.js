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
  , ObjectID  = require('mongodb').BSONPure.ObjectID
  , Schema    = require('./schema')
  , category  = require("./category")
  ;

var config          = global.CONFIG
  , MESSAGES        = config.MESSAGES
  , DATA_CONFIG     = config.DATA_CONFIG
  , GENERAL_CONFIG  = config.GENERAL_CONFIG
  , adapter         = global.adapter = require('./dataAdapter/' + GENERAL_CONFIG.dataAdapter)
  , webSvr          = global.webSvr
  , Articles        = global.Articles
  , Users           = global.Users
  , articlesCount   = global.articlesCount
  ;

webSvr.handle(GENERAL_CONFIG.rootEditUrl, function(req, res) {
  var username  = req.session.get("username")
    , id        = req.params.id
    , userInfo  = Users.users[username] || {}
    ;

  if (id == "add") {
    var interval = getPostInterval(userInfo);
    if (interval > 0) {
      return res.end(MESSAGES.NEED_WAIT.format(interval));
    }

    res.render(GENERAL_CONFIG.rootEditTmpl, {
        categoryOpts: category.categoryOpts
      , keywordsOpts: category.keywordsOpts
      , username:     username
      , isAdmin:      userInfo.isAdmin
    });
  } else {
    var article = Articles.all[id];
    if (article && (!article.poster || article.poster === username || userInfo.isAdmin)) {
      var renderArticle = Object.create(article);
      renderArticle.categoryOpts  = category.categoryOpts;
      renderArticle.keywordsOpts  = category.keywordsOpts;
      renderArticle.isAdmin       = userInfo.isAdmin;
      renderArticle.username      = username;
      res.render(GENERAL_CONFIG.rootEditTmpl, renderArticle);
    } else {
      res.end(MESSAGES.NOPERMISSION);
    }
  }
});

var postIntervals = {};

var getPostInterval = function(userInfo) {
  if (!userInfo.username) {
    return 1000000;
  }

  var curDate   = + new Date() / 1000 | 0
    , interval  = (postIntervals[userInfo.username] | 0) + GENERAL_CONFIG.postInterval - curDate
    ;

  interval < 0 && (interval = (userInfo.joinedTime / 1000 | 0) + GENERAL_CONFIG.newerInterval - curDate);

  return interval;
};

webSvr.handle("/root/edit.post", function(req, res) {
  var article   = req.body
    , username  = req.session.get('username')
    , userInfo  = Users.users[username] || {}
    , isEdit    = article._id && Articles.all[article._id]
    ;

  if (!isEdit) {
    var interval = getPostInterval(userInfo);
    if (interval > 0) {
      return res.end(MESSAGES.NEED_WAIT.format(interval));
    }
  }

  if (article.title
    && (!article.poster || article.poster === username || userInfo.isAdmin)) {
    article.description = article.summary ? utility.description(article.summary) : '';
    article.poster      = article.poster || username || '';
    article.verify      = parseInt(article.verify) || 0;

    !userInfo.isAdmin && article.verify !== -1 && (article.verify = 0);

    Schema.filter('article', article);

    var redirect = function() {
      /*
      * redirect to article detail page
      * etc: /detail/:id or /article/:id
      */
      var detailUrl = GENERAL_CONFIG.detailUrl;
      //Array?
      typeof detail === 'Object' && (detailUrl = detailUrl[0]);

      res.redirect(GENERAL_CONFIG.detailUrl.replace(':id', article._id));
    };

    if ( isEdit ) {
      adapter.update(article._id, 'article', article, function(result) {
        //After update merge other fields from the old article
        utility.merge(article, Articles.all[article._id]);
        Articles.update(article);
        redirect();
      });
    } else {
      article.url       = utility.addTag(article.url);
      article.postdate  = +new Date();
      adapter.insert('article', article, function() {
        Articles.update(article);
        redirect();
      });
      postIntervals[username] = +new Date() / 1000 | 0;
    }
    return;
  }
  res.send('html', MESSAGES.NOPERMISSION);

}, 'qs');


webSvr.handle(GENERAL_CONFIG.rootDeleUrl, function(req, res) {
  var id        = req.params.id
    , username  = req.session.get('username')
    , userInfo  = Users.users[username] || {}
    , article   = Articles.all[id]
    ;

  if (article && (!article.poster || article.poster === username || userInfo.isAdmin)) {
    article.verify == '1'
      ? res.end(MESSAGES.CANNOT_DELETE_VERIFIED)
      : adapter.delete(id, 'article', function(result) {
          res.end("removed " + result);
          result && Articles.remove(article);
      });
    return;
  }

  res.end(MESSAGES.NOPERMISSION);
});

webSvr.handle(GENERAL_CONFIG.rootPubUrl, function(req, res) {
  var id          = req.params.id
    , username    = req.session.get('username')
    , userInfo    = Users.users[username] || {}
    , article     = Articles.all[id]
    , updateJSON  = {verify: 1, publishTime: +new Date()}
    ;

  if (article && userInfo.isAdmin) {
    GENERAL_CONFIG.similarList && (updateJSON.similar = Articles.findSimilar(article));
    GENERAL_CONFIG.hottestList && (updateJSON.hottest = articlesCount.hottest);

    adapter.update(id, 'article', updateJSON, function(result) {
      res.end('Updated ' + result);
      result && Articles.update(article, updateJSON);
    });
    return;
  }

  res.end(MESSAGES.NOPERMISSION);
});


webSvr.handle('/reply/add/:id', function(req, res) {
  var id          = req.params.id
    , poster      = req.session.get('username')
    , last_reply  = req.session.get('last_reply')
    , reply       = req.body
    , article     = Articles.all[id]
    ;

  if (last_reply && article && reply && (poster || reply.nickname)) {
    var interval  = last_reply + GENERAL_CONFIG.replyInterval - (new Date() / 1000 | 0)

    if ( interval > 0 ) {
      return res.end(MESSAGES.NEED_WAIT.format(interval));
    }

    poster && (reply.poster = poster);
    reply.postdate  = + new Date();

    Schema.filter('reply', reply);

    article.replies
      ? (article.replies.push(reply))
      : (article.replies = [reply]);

    var updateJSON = { 
        replies   : article.replies
      , replyTime : reply.postdate
    };

    adapter.update(id, 'article', updateJSON, function(result) {
      res.end(result ? '' : 'error');
      result && Articles.update(article, updateJSON);
    });

    req.session.set('last_reply', + new Date() / 1000 | 0);

  } else {
    res.end(MESSAGES.NOPERMISSION);    
  }

}, 'json');


webSvr.handle('/reply/del/:id/:idx', function(req, res) {
  var id        = req.params.id
    , idx       = req.params.idx
    , userInfo  = Users.users[req.session.get('username')]
    , article   = Articles.all[id]
    ;

  if (idx && article) {
    var reply = article.replies[idx];
    if (reply && userInfo && (userInfo.username == reply.poster || userInfo.isAdmin)) {
      reply.deleted = true;

      Schema.filter('reply', reply);

      var updateJSON = { replies   : article.replies };
      adapter.update(id, 'article', updateJSON, function(result) {
        res.end(result ? '' : 'error');
        result && Articles.update(article, updateJSON);
      });
    }
  }
});