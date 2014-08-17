/*
* Configuration for theme "magazine"
*/

var debug = true;

var WEBSVR_CONFIG = {
    /*
    * Parameters used for WebSvr
    */
    debug           : debug
  , home            : "./web/magazine"
  , port            : 8054
  , cache           : !debug
  , templateCache   : !debug
  , listDir         : debug
  , defaultPage     : ''
  , 404             : "404.tmpl"
  , sessionTimeout  : 36000000
  //want to share same cookie between bbs.ourjs.com and ourjs.com? Using: ourjs.com
  , sessionDomain   : ''
};


/*
* Meta(Template/Url)
*/
var GENERAL_CONFIG = {
    debug           : debug
  , keyPageSize     : 40
  , pageSize        : 10
  , dataAdapter     : 'fileAdapter'
  , dataModelsDir   : './data/models'
  , countFolder     : './data/counts'
  , schemaFolder    : './data/schema'
  //A new user need some time to post article
  , newerInterval   : 5 * 60
  //Minimal post interval (seconds)
  , postInterval    : 5 * 60
  , replyInterval   : 30
  , hottestList     : false
  , similarList     : false
  , homeUrl         : ['/home', '/email', '/rss', '/json']
  , keyUrl          : ['/forum/:keyword/:pageNumber', '/forum_rss/:keyword/:pageNumber']
  , detailUrl       : '/article/:id'
  , userUrl         : ['/userinfo/', '/userjson/']
  , renderTmplUrl   : ['/signin', '/signup']
  , rootEditTmpl    : 'edit.tmpl'
  , rootEditUrl     : '/root/edit/:id'
  , rootDeleUrl     : '/root/delete/:id'
  , rootPubUrl      : '/root/publish/:id'
  , CONNECTIONSTR   : ''
  , CRYPTOKEY       : '!@#$qwer4rfv%TGB'
};


var MESSAGES = {
    NOPERMISSION                    : 'No permission!'
  , TIMEOUT                         : 'Session timeout please sign in and try again'
  , NEED_WAIT                       : 'You need to wait {0} seconds'
  , DUPLICATED                      : 'Duplicated username or email'
  , CANNOT_DELETE_VERIFIED          : 'You cannot delete published article'
  , USERNAME_PASSWORD_NOT_MATCH     : "Username and password do not match"
  , SERVER_DATA_SYNC_ERROR          : 'Sync data error'
  , SCHEMA_NOT_FOUND                : 'Schema not found!'
};


/*
Categories: Key and title
*/
var CATEGORIES = {
    ''          : 'OurJS - Free (Team) Blog, Website and CMS platform based on Node.JS'
  , 'Learn'     : 'Ourjs - Everything'
  , 'Themes'    : 'OurJS - Themes'
  , 'Plugins'   : 'OurJS - Plugins'
};


/*
* Keywords: Key and title
*/
var KEYWORDS = {
    ''            : 'OurJS Forum - Free (Team) Blog, Website and CMS platform based on Node.JS'
  , 'Support'     : 'Help and support center - OurJS'
  , 'Ask'         : 'Ask for help  - OurJS'
  , 'Share'       : 'Share OurJS - OurJS'
};


var PLUGINS = [
    './admin/data/manager.js'
];


/*
Exports
*/
typeof module !== 'undefined' && (module.exports = {
    WEBSVR_CONFIG   : WEBSVR_CONFIG
  , GENERAL_CONFIG  : GENERAL_CONFIG
  , MESSAGES        : MESSAGES
  , CATEGORIES      : CATEGORIES
  , KEYWORDS        : KEYWORDS
  , PLUGINS         : PLUGINS
});