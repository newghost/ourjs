OurJS 0.1.x
====

Free Blog Engine, Forum System, Website Template and CMS Platform based on Node.JS
----

Author : Kris Zhang

# [version 0.1.x](https://github.com/newghost/ourjs/tree/0.1.x) using redis
# [version 0.0.x](https://github.com/newghost/ourjs/tree/0.0.x) using memory & file system



OurJS 0.1.x 版
====

OurJS 基于Node.JS的开源的高性能博客引擎，网站模板，论坛系统和轻量级的CMS系统



# [ver 0.0.x](https://github.com/newghost/ourjs/tree/0.0.x) 基于文件系统
# [ver 0.1.x](https://github.com/newghost/ourjs/tree/0.1.x) 基于Reis


常见问题
====


为什么ver 0.1.x版可以应对超大规模并发
----

ver0.0.x 使用内存和文件系统；　相当于在node.js中实现了一个内存数据库，即先读写内存立即返回后，再同步到文件系统； 这种机制的优点是无任何依赖只需要装node.js即可运行，使用非常低的服务器配置就可支撑较大流量，运行稳定，半年多重启一次； ourjs.com 使用这种构架；　缺点是所有状态都在一个node.js线程中，无法分布式集群化部署，理论上无法应对超大规模并发流量，而且数据操作会有些复杂。

ver0.1.x 所有session和内容均存放在redis中，网站进程不存放任何状态， 当需要应对超大规模流量时可布暑多个ourjs实例，通过更改config.js，让每个实例侦听不同端口，然后通过nginx反向代理或 DNS round robin 做负载均衡，集群化布暑和单个布暑不需要更改应用层的任何代码，水平扩展性良好。


为什么不用mongodb？如何像mongodb那样操作redis
----

mongodb是非常好的nosql文档数据库，数据更新查询非常方便，但它是基于文件系统的，硬盘I/O的读写速度会严重限制网站可承受的最大并发量。
而redis是目前公认的速度最快的基于内存的键值对数据库，但redis的缺点也非常明显，仅提供最基本的hash set, list, sorted set等基于数据类型，不分表，没有schema，没有索引，没有外键，缺少int/date等基本数据类型，操作不便，开发效率低，可维护性不佳； 因此一般不将其视为完整的数据库单独使用，很多网站将redis作为高速缓存和session状态存储层，然后再与其他数据库搭配使用。 




如何安装和快速入门
----

要运行 ourjs　请先安装　[redis](http://redis.io)

中文支持： http://ourjs.com/bbs/OurJS




















License
----

BSD, See our license file