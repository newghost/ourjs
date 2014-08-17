//import namespace
var fs              = require('fs')
  , path            = require('path')
  , webSvr          = global.webSvr
  , Users           = global.Users
  , config          = global.CONFIG
  , adapter         = global.DataAdapter
  , SCHEMA          = global.SCHEMA
  , DATA_MODELS     = global.DATA_MODELS
  , MESSAGES        = config.MESSAGES
  ;


/*
* Only admin user can access these plugins
*/
webSvr.filter('/admin/', function(req, res) {
  var username  = req.session.get('username')
    , loginUser = Users.users[username] || {}
    , url       = req.url
    ;

  //Check permission
  if (!loginUser.isAdmin) {
    res.end(MESSAGES.NOPERMISSION);
  }

  //Mapping static files
  else if (url.indexOf('.js') > 0 || url.indexOf('.css') > 0) {
    var idx = url.indexOf('?');
    idx > 0 && (url = url.substr(0, idx));
    console.log(url);
    res.sendRootFile(url);
  }

  //Execute next filter
  else {
    req.filter.next();
  }
});

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