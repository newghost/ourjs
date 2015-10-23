Redblade
====

Redis ORM/Index Helper
----

Author : Kris Zhang


License
----

BSD, See our license file


Create and remove index key automatically








Init

    //create a redis client
    var client = require('redis').createClient();

    //choose an empty DB
    client.select(4)

    //schema is optional
    redblade.init({ schema:'/path/to/your/schema/folder',  client: client }, function(err) {
        
    })



Load Schema: article


      redblade.schema('article', {
          "_id"         : "id"
        , "poster"      : "index('user_article')"
        , "keywords"    : "keywords('articlekeys', return +new Date() / 60000 | 0)"
        , "title"       : ""
        , "content"     : ""
      })


Insert an article

    redblade.insert('article', {
       _id        : '1234567890'
      , poster     : 'airjd'
      , keywords   : '信息技术,JavaScript,NoSQL'
      , title      : '测试用的SLIDE 标题'
      , content    : '测试用的SLIDE 内容'
    }, function(err) {

    })


Select User by Index Field

    redblade.select('article', { poster:'airjd' }, function(err, articles) {
      console.log(articles[0])
    })

    //or

    redblade.select('article', { keywords: 'NoSQL' }, function(err, articles) {
      console.log(articles[0])
    })



What happened?

    /*
    sorted set: "keywords" : "keywords('articlekeys', return +new Date() / 60000 | 0)"
    */
    redblade.client.smembers('articlekeys', function(err, keys) {
        console.log(keys)
        //['信息技术','JavaScript','NoSQL']
    })

    redblade.client.zrange('articlekeys:NoSQL', 0, 100, function(err, articleIDs) {
        console.log(articleIDs)
        //["1234567890"]
    })


    /*
    set: "poster" : "index('user_article')" => user_article:[poster value]
    */
    redblade.client.smembers('user_article:airjd', function (err, articleIDs) {
        console.log(articlesIDs)
    })




Remove articles

    redblade.remove('article', { poster: 'airjd', keywords: 'SQL' }, function(err, num) {
        console.log(num)

        redblade.client.zrange('articlekeys:NoSQL', 0, 100, function(err, members) {
          //should be []
          console.log(members)
        })
    })
