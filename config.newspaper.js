/*
* Configuration for theme "newspaper"
*/

var debug = true;

var WEBSVR_CONFIG = {
    /*
    * Parameters used for WebSvr
    */
    debug           : debug
  , home            : "./web/newspaper"
  , port            : 8052
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
  , urlSlug         : 'FORMAT_TITLE'
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
  , hottestList     : true
  , similarList     : true
  , homeUrl         : ['/home', '/email', '/rss', '/json', '/layout1', '/layout2', '/layout3', '/layout4', '/layout5']
  , keyUrl          : ['/key/:keyword/:pageNumber', '/bbs/:keyword/:pageNumber', '/bbs_rss/:keyword/:pageNumber']
  , detailUrl       : '/detail/:id'
  , userUrl         : ['/userinfo/', '/userjson/']
  //etc: http://code.ourjs.com/useredit/{0}
  , noIDUserEditUrl : ''
  , renderTmplUrl   : ['/login']
  , rootEditTmpl    : 'root/edit.tmpl'
  , rootEditUrl     : '/root/edit/:id'
  , rootDeleUrl     : '/root/delete/:id'
  , rootPubUrl      : '/root/publish/:id'
  , CONNECTIONSTR   : 'mongodb://newghost:dachun0000000@ourjs.com/ourjs'
  , CRYPTOKEY       : '!@#$qwer4rfv%TGB'
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


/*
Categories: Key and title
*/
var CATEGORIES = {
    ''           : '爱我技术 我们的技术-IT文摘 JavaScript社区 Node.JS社区 前端社区 全端论坛 MongoDB html5 CSS3 开源社区'
  , '大话编程'   : '大话编程：讲述编程界的奇闻异事，讲述大神程序员的传奇故事，分享IT码农们那传奇彪悍的人生'
  , '轻松一刻'   : '轻松一刻：有关IT界的段子，码农幽默，骇客奇闻，程序员情感，软件开发与测试趣闻'
  , 'JS学习'     : 'JavaScript 学习：JavaScript，Node.JS，jQuery，Html5，CSS3 所有JS相关技术的学习，经验，教程，心得，分享'
  , 'JS开源'     : 'JavaScript 开源, Node.JS 开源：关注一切与JavaScript相关的开源技术，行业最火使用最广泛的开源框架，JavaScript，CoffeeScript，MongoDB，Node.JS，HTML5，CSS3'
  , '技术前沿'   : '技术前沿：网络前沿-IT技术，大数据，NoSQL，数据挖掘，高并发，引爆IT界革命的趋势性技术'
  , '编程技巧'   : '编程技巧：IT民工如何提升业务水平？经典算法，技术技巧，JavaScript，jQuery，Linux/Shell，Mongodb高效技巧学习'
  , '骇客攻防'   : '骇客攻防：网络安全学习，黑客教程, 黑客技巧, 骇客攻防演练, 我们不是要去黑别人, 知己知彼, 才能防止别人黑!'
  , '心得体会'   : '心得体会：程序设计开发心得体会，程序员应具有的素质，JavaScript C C++ Python Java C#.Net编程经验分享'
  , '我要吐嘈'   : '我要吐嘈：码农的辛酸史，IT从业者的苦B生活，程序员的悲凉谁人知'
  , '创业辛勤'   : '创业辛勤：IT人创业，程序员创业成功经验、失败教训和艰苦历程；创业经验文章集，让你创业更容易'
  , '求职面试'   : '求职面试：JavaScript面试心得，前端程序员面试宝典，Node.JS面试经验分享，面试大全，经历，基本流程，面试技巧方法大全，JavaScript，Java，C#.net，前端面试'
  , '行业动态'   : '行业动态：IT江湖的腥风血雨；科技巨头们的跑马圈地；大数据，NoSQL，互联网金融，电商将如何演绎'
  , '挨踢职场'   : '挨踢职场：码农，你从哪里来？你将往何处去？分享程序员职业生涯的酸甜苦辣，奇葩经历，悲惨故事'
  , '开源OurJS'  : '免费，开源的博客引擎，论坛系统，网站模板和轻量级的内容管理系统'
};


/*
* Keywords: Key and title
*/
var KEYWORDS = {
    ''            : '全栈社区:全端=前端+后端;全能开发者论坛;一站式,程序员,软件工程师家园,JavaScript,Node.JS,HTML5,CSS3,Web,Ruby,Python'
  , '分享'        : '分享社区： 分享程序员,码农人生,挨踢职场 - OurJS'
  , '提问'        : '问答社区: 专业面向全栈工程师的中文技术问答社区 - OurJS'
  , '展示'        : '展示社区: 全栈工程师作品,项目,生活,创业 - OurJS'
  , '开源'        : '开源社区: 全栈式的开源项目,分享和交流 - OurJS'
  , 'JavaScript'  : 'JS社区: 专业JavaScript学习论坛,初学者问答,入门教程,资源 - OurJS'
  , 'Node.JS'     : 'Node.JS社区: 专业NodeJS学习讨论论坛,讨论论坛,初学者问答,入门教程,资源 - OurJS'
  , '前端'        : '前端社区： 专注Web网站设计与开发,最专业的前端技术论坛 - OurJS'
  , 'Html5'       : 'Html5社区: 专业Web技术学习讨论论坛,初学者问答,入门教程,资源 - OurJS'
  , '创业'        : '创业社区: 寻找靠谱全端全能技术合伙人,低成本创业,投资,融资,互联网 - OurJS'
  , '招聘'        : '招聘社区: 免费发布招聘信息论坛,前端,JavaScript,Node.JS,全端招聘 - OurJS'
  , '瞎扯'        : '瞎扯蛋: IT杂谈，大话编程，开心一刻 - OurJS'
  , 'OurJS'       : 'OurJS支持: 免费开源博客, 网站模板，论坛系统，CMS安装、使用支持 - OurJS'
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
  , GENERAL_CONFIG  : GENERAL_CONFIG
  , MESSAGES        : MESSAGES
  , CATEGORIES      : CATEGORIES
  , KEYWORDS        : KEYWORDS
  , PLUGINS         : PLUGINS
  , REDIS_CONFIG    : REDIS_CONFIG
});