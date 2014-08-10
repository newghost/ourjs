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
  , config      = global.CONFIG = require(path.join('../', process.argv[2]))
  , Schema      = require('./schema')
  , Count       = require('./count')
  , utility     = require('./utility')
  ;


/*
* js library used for both front-end and back-end;
*/
require('../lib/string.js')();


var GENERAL_CONFIG  = config.GENERAL_CONFIG
  , WEBSVR_CONFIG   = config.WEBSVR_CONFIG
  , MESSAGES        = config.MESSAGES
  , debug           = GENERAL_CONFIG.debug
  , pageSize        = GENERAL_CONFIG.pageSize
  ;


//Start the WebSvr
var articlesCount = new Count('articles', GENERAL_CONFIG.countFolder)
  , webSvr        = new WebSvr(WEBSVR_CONFIG).start()
  ;

//webSvr.engine(require("./doT").compile);
//for debuging
if (debug) {
  webSvr.url("css/ourjs.min.css", ["css/ourjs.css"]);
  webSvr.url("css/prod.min.css",  ["css/prod.css"]);
  webSvr.url("js/ourjs.min.js",   ["js/ourjs.js"]);
  webSvr.url("js/prod.min.js",    ["js/prod.js"]);
}


var category    = require("./category")
  , categories  = config.CATEGORIES
  , keywords    = config.KEYWORDS
  ;


//Bindings
var model = {
    categories : categories
  , keywords   : keywords
  , homemeta   : 'home'
};
//Default model of webSvr, for header/footer
webSvr.model(model);


webSvr.session(function(req, res) {
  var url     = req.url
    , host    = req.headers.host
    ;

  //auto signed in user
  if (!req.session.get('username')) {
    var signedUser = Users.autosign(req.cookies);
    signedUser && req.session.set('username', signedUser.username);
  }

  !req.session.get('last_reply') && req.session.set('last_reply', + new Date() / 1000 | 0);

  //if root dir redirect to home, etc /, /?abc=1234
  if (url == '/' || url[1] == '?') {
    if (host == 'bbs.ourjs.com') {
      keyListHandler(req, res, "/key/");
    } else {
      showListHandler(req, res, "/home/");
    }
  } else {
    req.filter.next();
  }
});

//handle: /templatename/category/pagenumber, etc: /home/all/0, /home, /json/all/0
var showListHandler = function(req, res, url) {
  var params      = webSvr.parseUrl('/:template/:category/:pagerNumber', url || req.url)
    , userInfo    = Users.users[req.session.get('username')] || {}
    , template    = params.template || 'home'
    , category    = params.category || ''
    , pageNumber  = parseInt(params.pagerNumber) || 0
    ;


  var articles = (Articles.categoryArticles[category] || []).slice(pageNumber * pageSize, (pageNumber + 1) * pageSize);

  if (template == 'rss') {
    res.type('xml');
  }

  if (template == 'json') {
    //render json page: remove contents in the article list
    var shortArticles = [];
    articles.forEach(function(article) {
      shortArticles.push({
          _id: article._id
        , url: article.url
        , author:   article.poster
        , title:    article.title
        , summary:  article.summary
        , content:  article.content ? 1 : 0
        , postdate: article.postdate
        , category: article.category
        , replyNum: (article.replies || '').length
      })
    });
    res.send(shortArticles);
  } else {
    //render html pages
    var config = {
        category  : category
      , pageSize  : pageSize
      , pager     : pageNumber
      , username  : userInfo.username
      , homemeta  : template
    };

    res.render(template + ".tmpl", {
        username    : userInfo.username
      , useravatar  : userInfo.avatar
      , homemeta    : template
      , title       : categories[category]
      , conf        : JSON.stringify(config)
      , articles    : articles
      , hottest     : articlesCount.hottest
      , replyList   : (Articles.keywordsArticles[''] || []).slice(0, 10)
      , nextPage    : '/' + template + '/' + category + '/' + (pageNumber + 1)
    });
  }
};

//127.0.0.1/ or 127.0.0.1/home/category/pagernumber
webSvr.url(GENERAL_CONFIG.homeUrl, showListHandler);

//handle detail.tmpl: content of article
var showDetailHandler = function(req, res) {
  var tmpl  = req.url.split('/')[1]     //get the template name
    , id    = req.params.id             //get the object id
    ;

  if (id && tmpl) {
    //Does it existing in the Articles?
    var article = Articles.find(id);

    var display = function(article) {
      //count the article
      articlesCount.add(id);

      var loginUser = Users.users[req.session.get('username')] || {};

      article.username    = loginUser.username;
      article.useravatar  = loginUser.avatar;
      article.isAdmin     = loginUser.isAdmin;
      article.related     = (Articles.keywordsArticles[article.keyword] || []).slice(0, 10);
      article.user        = Users.users[article.poster] || {};

      res.render(tmpl + ".tmpl", article);
    };

    if (article) {
      display(article);
    } else {
      res.end();
    }
  } else {
    res.end();
  }
};

//127.0.0.1/detail/2340234erer23343[OjbectID]
webSvr.url(GENERAL_CONFIG.detailUrl, showDetailHandler);

webSvr.url("updatecache", function(req, res) {
  var username = req.session.get('username');

  if ((Users.users[username] || {}).isAdmin) {
    Users.refresh();
    Articles.refresh();
    res.end();
  } else {
    res.send(401, MESSAGES.NOPERMISSION);
  }
});

//handle url: /jsondetail/articleid
webSvr.url("/jsondetail/:id", function(req, res) {
  var id = req.params.id;

  if (id) {
    var article = Articles.find(id);
    res.send({
        title       : article.title
      , url         : article.url
      , content     : article.content || article.summary
    });
  } else {
    res.end();
  }
});

webSvr.url('/useredit/:username', function(req, res) {
  var username  = req.params.username
    , loginUser = req.session.get('username')
    ;

  if (username == loginUser || (Users.users[loginUser] || {}).isAdmin) {
    var userInfo = Users.users[username];
    if (userInfo) {
      return res.render('useredit.tmpl', {
          user:     userInfo
        , username: loginUser
      });
    }
  }
  res.send(MESSAGES.TIMEOUT);
});

var signHandler = function(req, res, userInfo) {
  if (userInfo && userInfo.username)  {
    req.session.set('username', userInfo.username);

    if (req.cookies.autosign || req.body.autosign === 'on') {
      var date = new Date(+new Date() + 365 * 24 * 3600 * 1000)
        , opts = { path: '/', expires: date, domain: WEBSVR_CONFIG.sessionDomain }
        ;

      res.cookie('autosign', userInfo.username, opts);
      res.cookie('_id', userInfo._id, opts);
      res.cookie('token', utility.getEncryption(userInfo.email), opts);

      req.url.indexOf('redirect') < 0
        ? res.send({username: userInfo.username, avatar: userInfo.avatar})
        : res.redirect('/');

      return true;
    }
  }

  req.url.indexOf('redirect') < 0 && res.send({});
  res.send(
    req.url.indexOf('signin') > 0
      ? MESSAGES.USERNAME_PASSWORD_NOT_MATCH
      : MESSAGES.DUPLICATED
  );

  return false;
};

webSvr.url('/user.signup.post', function(req, res) {
  var postInfo = req.body
    , userInfo = {
        username: postInfo.username
      , password: postInfo.password
      , email:    postInfo.email
    };

  Users.signup(userInfo, function(signupUser) {
    signHandler(req, res, signupUser);
  });

}, 'qs');

webSvr.url('/user.signin.post', function(req, res) {
  var postInfo = req.body
    , userInfo = {
        username: postInfo.username
      , password: postInfo.password
    };

  var signedUser = Users.signin(userInfo) || {};
  signHandler(req, res, signedUser);

}, 'qs');

/*
* user.edit.post: response json
*/
webSvr.url('/user.edit.post', function(req, res) {
  var postInfo  = req.body
    , loginUser = Users.users[req.session.get('username')];

  if (loginUser) {
    utility.extend(postInfo, {
        _id           : loginUser._id
      , username      : loginUser.isAdmin ? postInfo.username : loginUser.username
    });

    Users.update(postInfo, function(done) {
      if (req.url.indexOf('redirect') < 0) {
        res.send({done:done});
      } else {
        done
          ? res.redirect('/')
          : res.send(MESSAGES.USERNAME_PASSWORD_NOT_MATCH);
      }
    });
  } else {
    res.end(MESSAGES.TIMEOUT);
  }

}, 'qs');

webSvr.url('/user.signout.post', function(req, res) {
  var username = req.session.get('username')
    , opts     = { path: '/' }
    ;
  req.session.set('username', '');
  res.cookie('autosign', null, opts);
  res.cookie('_id', null, opts);
  res.cookie('token', null, opts);
  req.url.indexOf('redirect') < 0
    ? res.send({done: true})
    : res.redirect('/');
});


var getPagination = function(config, pagerFormat) {
  var interval = 5
    , curPager = config.pager || 0
    , maxPager = config.count / config.pageSize | 0
    , startPos = curPager - (interval / 2 | 0)
    ;

  maxPager - startPos < interval && (startPos = maxPager - interval);
  startPos < 1 && (startPos = 1);

  var pagination  = ''
    , paginations = []
    ;

  var addPage = function(pager) {
    paginations.push(
      pagerFormat.format(pager, curPager == pager ? 'class="active"' : '')
    );
  };

  addPage(0);
  startPos > 1 && paginations.push('<li><a>…</a></li>');
  for (var i = 0; startPos < maxPager && i < 5; i++, startPos++) {
    addPage(startPos);
  }
  startPos < maxPager && paginations.push('<li><a>…</a></li>');
  maxPager > 0 && addPage(maxPager);

  pagination = '<ul class="len{0}" style="table-layout:fixed;">{1}</ul>'.format(paginations.length, paginations.join(''));

  return pagination;
};

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
    , pageSize    = GENERAL_CONFIG.keyPageSize
    , articles    = allArticles.slice(pageNumber * pageSize, (pageNumber + 1) * pageSize)
    ;

  var config = {
      keyword:  keyword
    , keymeta:  keymeta
    , pageSize: pageSize
    , count:    count
    , pager:    pageNumber
    , username: userInfo.username
  };

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
  });
};

/*
Handle: '/key/Node.JS/0'
*/
webSvr.url(GENERAL_CONFIG.keyUrl, keyListHandler);

/*
userinfo: get userinfo and he articles
*/
webSvr.url(GENERAL_CONFIG.userUrl, function(req, res) {
  var url = req.url
    , idx = url.indexOf('?')
    ;

  idx > -1 && (url = url.substr(0, idx));

  /*
  Get parameters: filter category
  url: '/userinfo/ourjs/0'
  */
  var arr         = req.url.split('/')
    , tmpl        = arr[1] || 'userinfo'
    , userid      = decodeURIComponent(arr[2]) || 'ourjs'
    , pageNumber  = parseInt(arr[3]) || 0
    , nextNumber  = pageNumber + 1
    , articles    = (Articles.userArticles[userid] || []).slice(pageNumber * pageSize, nextNumber * pageSize)
    ;

  articles.length < pageSize && (nextNumber = 0);

  if (tmpl == 'userjson') {
    var shortArticles = [];
    articles.forEach(function(article) {
      shortArticles.push({
          _id: article._id
        , url: article.url
        , author:   article.poster
        , title:    article.title
        , summary:  article.summary
        , content:  article.content ? 1 : 0
        , postdate: article.postdatetime
        , category: article.category
        , keyword:  article.keyword
        , replyNum: (article.replies || '').length
      })
    });
    res.send(shortArticles);
  } else {
    res.render(tmpl + ".tmpl", {
        list:     articles
      , user:     Users.users[userid]
      , next:     nextNumber
      , conf:     JSON.stringify({ pageSize: pageSize })
      , username: req.session.get('username')
    });
  }
});

webSvr.url(GENERAL_CONFIG.renderTmplUrl, function(req, res) {
  res.render(webSvr.parseUrl('/:tmpl', req.url).tmpl + '.tmpl', {});
});

/*
Init User and Article
*/
var initData = function() {
  var Users     = global.Users        = require('./users')
    , Articles  = global.Articles     = require('./articles')
    ;

  //init Articles;
  //for users
  Users.refresh();
  //for articles
  Articles.refresh();

  //When articles refreshed
  Articles.notify.on('done', function() {
    articlesCount.refresh(Articles);
  });
};


var initPlugins = function() {
  /*
  * For administration
  */
  require('./root');

  /*
  * Loading plugins
  */
  config.PLUGINS.forEach(function(plugin) {
    try {
      require(path.join('../', plugin));
    } catch (err) {
      console.log('Error while loading plugin:', plugin, err);
    }
  });
};


/*
* Init
*/
(function() {
  /*
  * Make these instances shared global
  */
  global.webSvr         = webSvr;
  global.articlesCount  = articlesCount;
  global.DataAdapter    = require('./dataAdapter/' + GENERAL_CONFIG.dataAdapter);

  /*
  * Init data models
  */
  Schema.notify.on('done', function() {
    initData();
    initPlugins();
  });

})();