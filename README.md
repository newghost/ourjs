OurJS 0.1.x
====

Free Blog Engine, Forum System, Website Template and CMS Platform based on Node.JS and Redis
----

Author : Kris Zhang

[ourjs 0.1.x](https://github.com/newghost/ourjs/tree/0.1.x) using redis  
[ourjs 0.0.x](https://github.com/newghost/ourjs/tree/0.0.x) using memory & file system



OurJS 0.1.x Beta版
====

OurJS 基于Node.JS和Redis的开源的高性能博客引擎，网站模板，论坛系统和轻量级的CMS系统

[ourjs 0.1.x](https://github.com/newghost/ourjs/tree/0.1.x) 基于Redis  
[ourjs 0.0.x](https://github.com/newghost/ourjs/tree/0.0.x) 基于内存和文件系统


常见问题
====




如何安装ourjs 0.1.x
----

首先下载最新的 ourjs，单击右侧的 [Download ZIP](https://github.com/newghost/ourjs/archive/0.1.x.zip) 下载最新版(也可使用 git clone 复制0.1.x的branch, npm中发布的是0.0.x版)； 然后你需要安装[redis](http://redis.io)，windows版的是由微软维护的，可在[MSOpenTech](https://github.com/MSOpenTech/redis)下载； 最后单击 ourjs.sh 或 ourjs.cmd 即可运行, 默认侦听 8051 端口， 即: http://localhost:8051
  
  
你可以安装第三方redis管理客户端 [RedisDesktopManager](http://redisdesktop.com/) 方便调试redis。
  

管理员用户： 首次使用，你需要指定一个管理员用户，你需要使用redis-cli或RedisDesktopManager为你注册的新用户添加isAdmin属性，值设为1，然后重新登录即可。

如你注册了一个新的用户ourjs，则可通过redis-cli用以下命令将其设置为管理员(ourjs默认使用第7个数据库)，运行命令后需要重新登录。

    select 7
    hset user:ourjs isAdmin 1


ourjs 0.1.x 基于哪些框架
----

1. web框架使用的是只有一个文件实现的[websvr](https://github.com/newghost/websvr)，支持include模板文件及其嵌套；
2. 数据库ORM采用的是[redblade](https://github.com/newghost/redblade) ( [文档](http://redblade.ourjs.com/) )，同样只用一个文件实现； 只要事先定好[schema](https://github.com/newghost/ourjs/tree/0.1.x/schema)，就能像mongodb那样操作redis，自动帮你创建index/ keyword等索引； 不过还是推荐使用原生redis指令读取数据，用redblade来更新数据，这样就可以发挥redis的超强性能。在使用时你需要对redis指令和数据类型非常熟悉。  
3. 模板引擎采用了性价比较高的 [doT](http://olado.github.io/doT/), 十分钟即可上手。


为什么新发布的文章无法在首页显示
----

只有发布后(article中的isPublic=1，并且在"public:1"有序集合中)的文章才可以在首页显示，未发布的文章都在“最新文章”中列出，你需要指定一名管理员用户，然后单击发布或取消发布即可。


为什么要保留node_modules文件夹
----

npm在中国经常出现不可用的情况； 同时ourjs所采用的所有模块都不是平台相关的；再加上有时侯需要对redblade等底层模块做一些修改，这些修改只有稳定运行一段时间才能正式发布到npm上面。不管你使用何种平台，保留node_modules都不影响你使用



为什么ourjs 0.1.x版可以应对超大规模并发
----

ourjs 0.0.x 基于内存和文件系统；相当于在node.js中实现了一个内存数据库，即先读写内存立即返回后，再同步到文件系统； 这种机制的优点是无任何依赖即可运行，单个实例性能强劲，使用非常低的服务器配置就可支撑较大流量，如 [ourjs](ourjs.com)使用最低配置云服务器，运行稳定，半年多重启一次；　缺点是所有状态都在一个node.js线程中，无法分布式集群化部署，理论上无法应对超大规模并发，而且数据更新操作会略显复杂。

ourjs 0.1.x 所有session和数据均存放在redis中，网站进程不存放任何状态， 当需要应对超大规模流量时可布暑多个ourjs实例，通过更改config.js，让每个实例侦听不同端口，然后通过nginx反向代理或 DNS round robin 做负载均衡，集群化布暑和单个实例布暑不需要更改应用层的任何代码。


为什么不用mongodb
----

mongodb是非常好的nosql文档数据库，数据更新查询非常方便，但它是基于文件系统的，硬盘I/O的读写速度会严重限制网站可承受的最大并发量。
而redis是目前公认的速度最快的基于内存的键值对数据库，但redis的缺点也非常明显，仅提供最基本的hash set, list, sorted set等基于数据类型，不分表，没有schema，没有索引，没有外键，缺少int/date等基本数据类型，多条件查询需要通过集合内联(sinter,zinterstore)和连接间接实现，操作不便，开发效率低，可维护性不佳； 因此一般不将其视为完整的数据库单独使用，很多网站将redis作为高速缓存和session状态存储层，然后再与其他数据库搭配使用。 所以我们设计了[redblade](https://github.com/newghost/redblade)用以简化redis的操作。


使用Redis内存撑爆了怎么办
----

首先redis是一个非常省内存的数据库，启动时只占用1M多内存，与node.js一样同为异步非阻塞构架，与多线程架构不同，其内存消耗不会随着并发的增长而显著增长 (注*[性能测评：Ngix_Lua, Node.JS Python](http://ourjs.com/detail/52954f16f45056c314000001))。其次目前已经有很多第三方的redis集群化部署方案，通过这些工具，你可以将redis部署成一个内存无限大的数据库。 



前端为什么要用[Bootstrap 2.3.2](http://getbootstrap.com/2.3.2/)
----

Bootstrap已经有了很大的更新的，但2.3.2版是对IE7兼容最好的一个版本。甚至还有一些支持IE6的第三方插件，比较适合中国国情。


为什么第一次加载页面布局会乱
----

WebSvr中有一个模板缓存对象，为了提升响应速度，会直接获取缓存中的模板，首次启动ourjs时，此缓存对象为空。在 deubg = true (config.js => templateCache = false)时，每次请求完成后会一直更新模板缓存；而在 debug = false 时，缓存对象一旦获取，将不再更新，即动态模板只会加载一次，以后都不会产生I/O操作，此时对模板的修改，需要重启ourjs进程。有些厂商会对I/O操作收费，对于静态资源一般走CDN单独部署或通过nginx设置。




相关资源、示例
----

1. 中文支持： http://ourjs.com/bbs/OurJS
2. [AnyNB](http://anynb.com) 股市牛博汇； 基于OurJS 0.1.x版； 运行在最低配的云服务器上: 512Mb内存+1核CPU+1M宽带； 运行进程: nodejs 2个(ourjs+文章自动采集进程)，redis，ftp，nginx等
3. [OurJS](http://ourjs.com) 我们的JavaScript； 基于OurJS 0.0.x版； 服务器配置：1G内存+1核CPU+1M宽带； 运行进程： nodejs 4个(网站3个，微信自助查询服务1个），redis，ftp，nginx，svn等； 从2013年底开始运营，在Google Analytics上观测千人在线时，网站也基本上能够秒开。

![https://raw.githubusercontent.com/newghost/blog/master/res/ga_ourjs.png](https://raw.githubusercontent.com/newghost/blog/master/res/ga_ourjs.png)


License
----

BSD, See our license file
