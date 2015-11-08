var redblade = require('../redblade')

var assert = require("assert")


describe('Redblade 测试用例', function() {

  var client
    , schema


  describe('装载SCHEMA，准备测试DB', function() {

    it('redblade: init 装载schema', function(done) {
      // client = require('./testRedisClient').getClient()

      //localhost
      client = require('redis').createClient();

      //切换测试用的DB 4
      client.select(4)

      redblade.init({ schema: './test/schema', client: client }, function(err) {
        if (err) {
          console.error(err)
          return
        }

        assert.equal(err, null)
        done()
      })
    })

    it('redis db: 是否为空数据库', function(done) {
      redblade.client.keys('*', function(err, keys) {
        assert.equal(keys.length, 0)
        done()
      })
    })

  })



  describe('验证SCHEMA:user', function() {

    it('SCHEMA["user"]: 检查user是否存在', function(done) {
      assert.equal(typeof redblade.SCHEMA['user'], 'object')
      done()
    })

    it('schema:user 主键是否为username', function(done) {
      assert.equal(redblade.SCHEMA['user']._idField_, 'username')
      done()
    })

  })




  describe('操作USER数据', function() {

    var userModel = {
       username   : 'airjd'
     , email      : 'c2u@live.cn'
     , inviter    : 'admin'
     , password   : '1'
     , '多余字段' : true
     , keywords   : '所有文章'
     , qq         : 0
    }

    it('redblade:filter 能否过滤掉不存在于schema中的[多余字段]', function(done) {
      redblade.filter('user', userModel, function(err, result) {

        //密码不合规
        assert.equal(result, false)
        assert.equal(userModel['多余字段'], undefined)
        assert.equal(userModel.keywords, undefined)

        done()
      })
    })

    it('redblade:insert 符合规则的用户', function(done) {
      //修改password，使其符合规则
      userModel.password = '1234'

      redblade.insert('user', userModel, function(err) {
        assert.equal(err, null)
        done()
      })
    })

    it('redblade:insert 重复的用户', function(done) {
      redblade.insert('user', userModel, function(err) {
        assert.equal(!err, false)
        done()
      })
    })

    it('redblade:判断相关性插入: inviter, user_email是否存在',  function(done) {
      redblade.client.keys('*', function(err, keys) {
        console.log(keys)
        assert.equal(keys.length, 3)
        done()
      })
    })

    it('redblade:select 通过ID字段username查找user', function(done) {
      redblade.select('user', { username: 'airjd' }, function(err, docs) {
        assert.equal(docs[0].email, 'c2u@live.cn')
        done()
      })
    })

    it('redblade:select 通过索引字段email查找user', function(done) {
      redblade.select('user', { email: 'c2u@live.cn' }, function(err, docs) {
        assert.equal(docs[0].username, 'airjd')
        done()
      })
    })

    it('redblade:select 通过ID:username和索引字段email查找user', function(done) {
      redblade.select('user', { username: 'airjd', email: 'c2u@live.cn' }, function(err, docs) {
        assert.equal(docs[0].inviter, 'admin')
        done()
      })
    })

    it('redblade:select 通过索引字段email和inviter查找user(两个索引字段均无权重，为无序集合内联操作)', function(done) {
      redblade.select('user', { inviter: 'admin', email: 'c2u@live.cn' }, function(err, docs) {
        assert.equal(docs[0].username, 'airjd')
        done()
      })
    })

    it('redblade:select 通过索引字段email查找不存在的user', function(done) {
      redblade.select('user', { email: 'c2u@live.cn2' }, function(err, docs) {
        assert.equal(docs.length, 0)
        done()
      })
    })

    it('redblade:select 检测update能否新增不存在的user', function(done) {
      var userModel = {
         username   : 'kris'
       , email      : 'c52u@live.cn'
       , inviter    : 'admin'
       , password   : '0000'
       , qq         : 1
      }

      redblade.update('user', userModel, function(err) {
        assert.equal(typeof err, 'object')
        console.log(err)
        redblade.update('user', userModel, function(err) {
          assert.equal(err, null)
          done()
        }, { mode: 'insert' })
      })
    })

    it('redblade:select 通过查找所有字段查找用户', function(done) {
      redblade.select('user', function(err, docs) {
        docs.sort(function(a, b) {
          return a.qq - b.qq
        })

        assert.equal(docs[0].username, 'airjd')
        assert.equal(docs[1].username, 'kris')
        done()
      })
    })



  })


  describe('操作SLIDE数据－使用定定义schema', function() {

    it('redblade:schema 动态加载schema', function(done) {

      redblade.schema('article', {
          "_id"         : "id"
        , "poster"      : "index('user_article')"
        , "keywords"    : "keywords('articlekeys', return +new Date() / 60000 | 0)"
        , "title"       : ""
        , "content"     : ""
      })

      var schema = redblade.SCHEMA['article']

      assert.equal(schema._idField_, '_id')
      //keywords的第一个参数为: articlekyes
      assert.equal(schema.keywords.keywords[0], 'articlekeys')

      done()
    })

    it('Redblade:insert article', function(done) {

      redblade.insert('article', {
         _id        : '1234567890'
       , poster     : 'airjd'
       , keywords   : '信息技术,JavaScript,NoSQL'
       , title      : '测试用的SLIDE 标题'
       , content    : '测试用的SLIDE 内容'
      }, function(err) {

        //记录单个keywords所包含的keys是一个ZSET
        redblade.client.zrange('articlekeys:NoSQL', 0, 100, function(err, members) {

          //所有keywords集合是一个SET
          redblade.client.smembers('articlekeys', function(err, keys) {
              assert.equal(err, null)

              redblade.client.smembers('user_article:airjd', function (err, articleIDs) {
                  assert.equal(err, null)

                  redblade.select('article', { poster:'airjd' }, function(err, articles) {
                      assert.equal(err, null)

                      assert.equal(members[0], '1234567890')
                      assert.equal(keys.length, 3)
                      assert.equal(articles[0]._id, '1234567890')
                      assert.equal(articleIDs[0], '1234567890')

                      done()
                  })
              })

          })

        })

      })
    })

    it('Redblade:select article by keywords', function(done) {
      redblade.select('article', { keywords: 'NoSQL' }, function(err, articles) {
        console.log(articles)
        assert.equal(articles.length, 1)
        assert.equal(articles[0].poster, 'airjd')
        done()
      })
    })


  })


  describe('测试有序集合的多条件联合查询 （即所有schema中定义的index/keywords均有权重）', function() {
    /*
    预定义schema
    */
    redblade.schema('document', {
        "docid"       : "id"
      , "poster"      : "index('doc_poster', return +new Date())"
      , "folder"      : "index('doc_folder', return +new Date())"
      , "keywords"    : "keywords('doc_keys', return +new Date())"
      , "publishTime" : "int; order('doc_publishTime', return this.publishTime)"
      , "content"     : ""
    })

    it('Redblade:insert document, 查询索引创建情况', function(done) {

      redblade.insert('document', {
          docid      : '0'
        , poster     : 'ourjs'
        , folder     : 'root'
        , keywords   : 'Java,BigData'
        , content    : 'document 1'
      })

      redblade.insert('document', {
          docid      : '1'
        , poster     : 'ourjs'
        , folder     : 'www'
        , keywords   : 'Redis,NoSQL'
        , content    : 'document 2'
      })

      redblade.insert('document', {
          docid      : '3'
        , poster     : 'airjd'
        , folder     : 'var'
        , keywords   : 'NoSQL'
        , content    : 'document 3'
      }, function(err) {

        //记录单个keywords所包含的keys是一个ZSET
        redblade.client.zrange('doc_folder:root', 0, 100, function(err, docIDs) {
          //所有keywords集合是一个SET
          redblade.client.smembers('doc_keys', function(err, keys) {
              assert.equal(err, null)

              redblade.client.zrange('doc_poster:ourjs', 0, 100, function (err, IDs) {
                  assert.equal(err, null)
                  assert.equal(docIDs.length, 1)
                  assert.equal(keys.length, 4)
                  assert.equal(IDs.length, 2)
                  done()
              })
          })
        })

      })
    })

    it('Redblade: 查询不存在的字段 fodler （应该为folder)', function(done) {
      redblade.select('document', { poster:'ourjs', fodler: 'www' }, function(err, documents) {
          assert.equal(documents.length, 0)
          done()
      })
    })

    it('Redblade: 根据两个有权重的索引进行查询', function(done) {
      redblade.select('document', { poster:'ourjs', folder: 'www' }, function(err, documents) {
        assert.equal(documents[0].docid, '1')
        done()
      })
    })


    it('Redblade: 插入大量document数据以便查询', function(done) {

      for (var i = 0; i < 1000; i++) {
        redblade.insert('document', {
            docid       : 'TEST' + i
          , poster      : i % 2 === 0 ? 'airjd' : 'ourjs'
          , folder      : i % 3 === 0 ? 'var' : 'tmp'
          , keywords    : (i % 2 === 0 ? '.NET,' : 'JAVA,') + (i % 3 === 0 ? 'NoSQL' : 'SQL')
          , content     : 'document ' + i
          , publishTime : (i + 1000)
        })
      }

      var timer = null

      redblade.client.on("idle", function() {
        if (timer) {
          clearTimeout(timer)
        }

        timer = setTimeout(function() {
          console.log('massive document created', arguments)
          done()
        }, 400)
      })

    })


    it('Redblade: select 前后数据并比较', function(done) {
      var where = { poster: 'airjd', folder: 'var', keywords: 'NoSQL' }

      //正序取的数据
      redblade.select('document', where, function(err, docs) {

        //倒序取的数据
        redblade.select('document', where, function(err, revdocs) {

          //中间的数据
          redblade.select('document', where, function(err, orderdocs) {

            //正序的第一个和倒序的最后一个应该相等
            assert.equal(docs[0].docid, revdocs[revdocs.length - 1].docid)
            assert.equal(docs[200].docid, orderdocs[0].docid)
            assert.equal(docs[300].docid, orderdocs[300 - 200].docid)

            console.log(docs[0])
            console.log(docs[200])
            console.log(docs[300])

            done()

          //设置分页; 200 ~ 300(含)
          }, {from: 200, to: 300})

        //desc 表示倒序
        }, { from: 0, to: 1000, desc: true })

      //设置分页; 200 ~ 300(含)
      }, { from: 0, to: 1000 })
    })


    it('Redblade: order 插入新的乱序document，检测其排序', function(done) {
      //更新TEST200的权重
      redblade.update('document', { docid : 'TEST200', publishTime: 100 }, function(err, result) {
        assert.equal(err, null)
        assert.equal(result, true)
        redblade.client.zrange('doc_publishTime', 0, 1000, function(err, IDs)  {
          assert.equal(IDs[0], 'TEST200')
          done()
        })
      })

    })


  })




  describe('删除相关测试数据', function() {

    //*清除数据
    it('Redblade: 清除document相关测试数据', function(done) {
      redblade.client.del('doc_keys')

      redblade.remove('document', { docid: '0' })
      redblade.remove('document', { docid: '1' })
      redblade.remove('document', { docid: '3' })

      for (var i = 0; i < 1000; i++) {
        redblade.remove('document', { docid : 'TEST' + i })
      }


      var timer = null

      redblade.client.on("idle", function() {
        if (timer) {
          clearTimeout(timer)
        }

        timer = setTimeout(function() {
          console.log('massive documents removed', arguments)
          done()
        }, 100)

      })

    })


    it('redblade:remove 通过索引字段删除并删除相关性', function(done) {
      redblade.remove('user', { inviter: 'admin' }, function(err, num) {
        assert.equal(num, 2)
        done()
      })
    })


    it('redblade:remove 检测删除文章后是否从关键字集合中移除，如 articlekeys:NoSQL', function(done) {
      redblade.remove('article', { poster: 'airjd', keywords: 'NoSQL' }, function(err, num) {
        redblade.client.zrange('articlekeys:NoSQL', 0, 100, function(err, members) {
          console.log(members)
          assert.equal(members.length, 0)
          done()
        })
      })
    })


    it('删除自动创建的索引后查看数据库集是否为空', function(done) {
      redblade.client.del('articlekeys', 'articlekeys:NoSQL', 'articlekeys:信息技术', 'articlekeys:JavaScript', function() {
        redblade.client.keys('*', function(err, keys) {
          console.log(keys)
          assert.equal(keys.length, 0)
          done()
        })
      })
    })



  })


})