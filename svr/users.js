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
  , Schema          = require('./schema')
  , config          = global.CONFIG
  , GENERAL_CONFIG  = config.GENERAL_CONFIG
  , adapter         = global.DataAdapter
  ;

/*
Users for caching
*/
var users       = {}
  , usersEmail  = {}
  ;

var refresh = function() {
  //Clear the cache objects
  for (var user in users) {
    delete users[user];
  }

  for (var user in usersEmail) {
    delete usersEmail[user];
  }

  adapter.select('user', function(docs) {
    for (var i = 0; i < docs.length; i++) {
      var user = docs[i];
      users[user.username] = user;
      users[user.email]    = user;
      user.avatar = utility.md5(user.email);
    }
    console.log('Refresh users', docs.length);
  });
};

/*
* User is existing, userInfo is undefined, username is undefined, user is existing
*/
var exist = function(userInfo) {
  return !userInfo
      || !userInfo.username
      || users[userInfo.username]
      || (userInfo.email && usersEmail[userInfo.email])
      ;
};

var signin = function(signinUser) {
  var userInfo;

  if (signinUser.username && signinUser.password) {

    userInfo = users[signinUser.username] || usersEmail[signinUser.username];

    if (userInfo && userInfo.password === utility.getEncryption(signinUser.password)) {
      return userInfo;
    }
  }

  return;
};

var autosign = function(cookieInfo) {
  if (cookieInfo.autosign && cookieInfo._id && cookieInfo.token) {
    var signedUser = users[cookieInfo.autosign] || {};
    if (signedUser._id == cookieInfo._id && utility.getEncryption(signedUser.email) == cookieInfo.token) {
      return signedUser;
    }
  }
  return;
};

var signup = function(userInfo, cb) {
  if (!exist(userInfo)
    && userInfo.username.length > 3 && userInfo.password.length > 3
    && userInfo.email.length > 3) {

    userInfo.password   = utility.getEncryption(userInfo.password);
    userInfo.joinedTime = + new Date();
    Schema.filter('user', userInfo);

    adapter.insert('user', userInfo, function(record) {
      //Update cache
      userInfo.avatar = utility.md5(userInfo.email);
      users[userInfo.username]   = userInfo;
      usersEmail[userInfo.email] = userInfo;
      return cb && cb(userInfo);
    });
  } else {
    return cb && cb(false);
  }
};

var update = function(userInfo, cb) {
  if ( userInfo._id
    && userInfo.username
    && userInfo.username.length > 3
    && userInfo.password
    && users[userInfo.username]
    ) {

    userInfo.password = utility.getEncryption(userInfo.password);

    if (users[userInfo.username].password !== userInfo.password) {
      return cb && cb(false);
    }

    if (userInfo.newPassword && userInfo.confPassword === userInfo.newPassword ) {
      userInfo.password = utility.getEncryption(userInfo.newPassword);
    }

    Schema.filter('user', userInfo);

    adapter.update(userInfo._id, 'user', userInfo, function(done) {
      //Update cache
      if (done) {
        !usersEmail[userInfo.email] && (usersEmail[userInfo.email] = users[userInfo.username]);
        utility.extend(users[userInfo.username], userInfo);
        utility.extend(usersEmail[userInfo.email], userInfo);
      }
      return cb && cb(done);
    });

  } else {
    return cb && cb(false);
  }
};

module.exports = {
    refresh     : refresh
  , autosign    : autosign
  , signin      : signin
  , signup      : signup
  , update      : update
  , users       : users
  , usersEmail  : usersEmail
};