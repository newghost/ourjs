/*
* Configuration for theme "newspaper"
*/

var debug = true;

var WEBSVR_CONFIG = {
    /*
    * Parameters used for WebSvr
    */
    debug           : debug
  , home            : "./web"
  , port            : 8051
  , cache           : !debug
  , templateCache   : !debug
  , listDir         : debug
  , defaultPage     : ''
  , 404             : "404.tmpl"
  , sessionTimeout  : 36000000
  //want to share same cookie between bbs.ourjs.com and ourjs.com? Using: ourjs.com
  , sessionDomain   : ''
  , serverID        : ''
};


var MESSAGES = {
    NOPERMISSION                    : 'No permission!'
  , TIMEOUT                         : 'Session timeout please sign in and try again'
  , NEED_WAIT                       : 'You need to wait {0} seconds'
  , CANNOT_DELETE_VERIFIED          : 'You cannot delete verified item'
  , USERNAME_PASSWORD_NOT_MATCH     : "Username and password do not match"
  , SERVER_DATA_SYNC_ERROR          : 'Sync data error'
  , SCHEMA_NOT_FOUND                : 'Schema not found!'
};


var PLUGINS = [
    './admin/data/manager.js'
];


/*
* Session stores in redis
* Filled in host to enable it, etc host: '127.0.0.1'
*/
var REDIS_CONFIG = {
    port    : 6379
  , host    : ''
  , auth    : ''
  , select  : 0
  , clean   : false
};

/*
Exports
*/
typeof module !== 'undefined' && (module.exports = {
    WEBSVR_CONFIG   : WEBSVR_CONFIG
  , MESSAGES        : MESSAGES
  , PLUGINS         : PLUGINS
  , REDIS_CONFIG    : REDIS_CONFIG
});