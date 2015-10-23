/*!@preserve
* redblade  : Powerful redis helper
* Copyright : Kris Zhang <kris.newghost@gmail.com>
* Homepage  : http://code.ourjs.com
* Project   : https://github.com/newghost/ourjs
* License   : BSD
*/

var fs              = require('fs')
  , path            = require('path')
  , events          = require('events')



var SCHEMA          = global.SCHEMA = {}
  , notify          = new events.EventEmitter()
  , client



var init = function(config, cb) {
  if (!config || !config.client) {
    cb && cb(new Error('Parameter is not completed'))
    return
  }

  client = config.client

  config.schema && loadSchema(config.schema, cb)
}

/*
例如schema:user的结构
{ _id     : { id: [] },
  username: { shown: [], string: [], minlen: [ '4' ], maxlen: [ '64' ], require: [] },
  password: { password: [], minlen: [ '4' ], maxlen: [ '32' ], require: [] },
  category: { keywords: [ 'category', [Function] ] }
}
*/
var loadSchema = function(schemaDir, cb) {
  fs.readdir(schemaDir, function(err, schemas) {
    if (err) {
      cb && cb(err)
      return
    }

    var num = 0

    schemas.forEach(function(schemaName) {
      var schemaPath = path.join(schemaDir, schemaName)
      fs.readFile(schemaPath, function(err, data) {
        num++

        if (err) {
          console.error('cannot load schema', schemaPath, err)
        } else {
          try {
            schemaName = schemaName.replace('.json', '').replace('.js', '')

            var schema = initSchema(JSON.parse(data.toString()), schemaName || '')

            SCHEMA[schemaName] = schema

            console.log('schema@' + schemaName, 'loaded')
            //console.log(schema)
          } catch(e) {
            console.error('parse schema error', schemaName, e.stack || e.message)
          }
        }

        if (num == schemas.length) {
          cb && cb()
        }
      })
    })
  })
}

var initSchema = function(schemaJSON, schemaName) {

  var fields  = Object.keys(schemaJSON)
    , schema  = {}
    , idField


  /*
  将rule转化成对象属性
  如 { _id: id, username: "require;maxlen(64),keywords('keyword', return +new Date())" }
  {
      _schema_  : {...}
    , _idField_ : _id 
    , _id: {}
    , username = { require: [], maxlen: [64], keywords: ["keywords", new Function("return +new Date()").bind(model) ] }
  }
  */
  for (var i = 0; i < fields.length; i++) {
    var field   = fields[i]
      , rules   = schemaJSON[field].split(';')
      , cmds    = {}

    //console.log(field, rules)

    for (var j = 0; j < rules.length; j++) {
      //左括号连同函数名存在
      var rule  = rules[j].trim()
        , func  = rule
        , args  = []

      if (rule) {

        var first = rule[0]

        //去除单/双引号
        if (first == '"' || first == "'") {
          rule = rule.substring(1, rule.length - 1)
        }

        if (rule == 'id') {
          idField = field
        }

        /*
        包含参数的函数: minlen(64)
        rule 去除括号
        args 提取参数到数组
        */
        var idx = rule.indexOf('(')
        if (idx > 0 && rule.lastIndexOf(')') == rule.length - 1) {
          func = rule.substr(0, idx).trim()
          args = rule.substring(idx + 1, rule.length - 1).split(',')


          //去除掉多余的空格、引号等
          for (var k = 0; k < args.length; k++) {

            var arg = (args[k] || '').trim()

            first = arg[0]

            //去除单/双引号
            if (first == '"' || first == "'") {
              arg = arg.substring(1, arg.length - 1)
            }

            //以return或头为自定义函数的参数：将此函数的返回值作为参数
            if (arg.indexOf('return') == 0) {
              try {
                arg = new Function(arg)
              } catch (e) {
                console.error('schema@' + schemaName + ' ' + field + ':' + func + ' custom function error ' + arg + ':' + e.toString())
              }
            }

            args[k] = arg
          }
        }

        cmds[func] = args
      }

      schema[field] = cmds
    }
  }

  if (!idField) {
    console.error('schema@' + schemaName + ' do not define ID field')
  }

  schema._schema_   = schemaJSON
  schema._idField_  = idField

  define(schema, '_schema_'  , { enumerable: false })
  define(schema, '_idField_' , { enumerable: false })

  return schema
}


/*
define schema
*/
var schema = function(schemaName, schemaJSON) {
  if (typeof schemaName != 'string' || typeof schemaJSON != 'object') {
    console.error('redblade@schema parameter error')
    return
  }

  SCHEMA[schemaName] = initSchema(schemaJSON, schemaName)
}


/*
filter，在数据插入之前做的预告判断，防止脏数据被插入数据库
比如说插入了一个poster不存在的slide或content
因此filter的自定义函数中可能查询而不应该添加更改数据库的操作
bit:
0 show in manager list
2 textarea
*/
var FILTERS = {}

FILTERS.require = function() {
  var value = this.value
  return typeof value != 'undefined'
}

FILTERS.int = function() {
  var field = this.field
    , value = this.value
    , model = this.model

  value = parseInt(value)

  model[field] = value || 0

  return !Number.isNaN(value)
}

FILTERS.max = function(maxNumber) {
  var field = this.field
    , value = this.value
    , model = this.model

  if (parseFloat(value) > parseFloat(maxNumber)) {
    return false
  }

  return true
}

FILTERS.min = function(minNumber) {
  var field = this.field
    , value = this.value
    , model = this.model

  if (parseFloat(value) < parseFloat(minNumber)) {
    return false
  }
  return true
}

FILTERS.maxlen = function(maxNumber) {
  var field = this.field
    , value = this.value
    , model = this.model

  if (value.length > parseFloat(maxNumber)) {
    return false
  }
  return true
}

FILTERS.minlen = function(minNumber) {
  var field = this.field
    , value = this.value
    , model = this.model

  if (value.length < parseFloat(minNumber)) {
    return false
  }
  return true
}

/*
唯一性判断，仅需要在插入时判断
*/
FILTERS.unique = function(schemaName) {
  var field       = this.field
    , value       = this.value
    , model       = this.model
    , schema      = this.schema
    , operator    = this.operator
    , done        = this.done

  var key = (schemaName || schema) + ':' + value

  //在insert时; ID不应该存在
  if (operator == 'insert') {
    client.exists(key, function(err, exist) {
      if (err) {
        console.error(err)
        return
      }

      done && done(err, !exist)
    })

    //返回null，告诉redblade需要等待回调
    return null
  }

  //不是insert模式，ID无需判断
  return true
}

FILTERS.id = FILTERS.unique




/*
Commands list
*/

var COMMANDS = { }

/*
sadd/srem
schema函数：添加外键集合

this = {
    field: 'poster'
  , value: 'airjd'
  , model: { _id: XXX }
}

1) 只带有一个参数则为，无权重的外键，无序集合(Sets)

poster: index('user_slide')

结果：
client.sadd('user_side:airjd', _idValue)

2) 第二个参数为权重，有序集合，可以为整数或者以return开始的自定义函数

poster: index('user_slide', return +new Date()/60000 | 0)

结果：
client.zadd('user_side:airjd', timeStamp, _idValue)

查询：注意！！
带权重的外键无法进行交集(left/right/inner join)、并集(union)、异或（not in）查询
只有集合有相关的命令： sinter / sunion / sdiff

operator类型： insert/update/remove
*/
COMMANDS.index = function(indexSchema, score) {
  var field     = this.field
    , value     = this.value
    , model     = this.model
    , operator  = this.operator
    , schema    = redblade.SCHEMA[this.schema] || {}
    , done      = this.done
    , _idField_ = schema._idField_
    , _idValue  = model[_idField_]

  if (!indexSchema || !field || !model || !_idField_ || typeof _idValue == 'undefined') {
    return false
  }

  var key = indexSchema + ':' + value

  if (operator == 'remove') {
    typeof score == 'undefined'
      ? client.srem(key, _idValue, done)
      : client.zrem(key, _idValue, done)
  } else {
    typeof score == 'undefined'
      ? client.sadd(key, _idValue, function(err) {
        if (err) {
          console.error(err)
        }
        done && done(err)
      })
      : client.zadd(key, score, _idValue, function(err) {
        if (err) {
          console.error(err)
        }
        done && done(err)
      })
  }

  //指定还没有处理完需要时间等待
  return null
}



/*
sadd/srem
schema函数：添加一些关键词索引，多对多的关系，一系列的有序集合，关于分钟的有序集合

keyword: keywords('category')

this = {
    field: 'keyword'
  , value: '信息技术,JavaScript'
  , model: { _id: XXX }
}

结果：
1) 先从所有keyword索引中删除，从category主数据中取
client.zrem('category:信息技术', _idValue)
client.zrem('category:Java', _idValue) ... [略]

2) 更新主数据 (无序集合)
client.sadd('category', '信息技术', 'JavaScript')

3）更新数据 (关于分钟的有序集合)
client.zadd('category:信息技术', score, _idValue)
client.zadd('category:JavaScript', score, _idValue)
*/
COMMANDS.keywords = function(keywordSchema, score) {
  var field     = this.field
    , value     = this.value
    , model     = this.model
    , operator  = this.operator
    , done      = this.done
    , schema    = redblade.SCHEMA[this.schema] || {}
    , _idField_ = schema._idField_
    , _idValue  = model[_idField_]

  if (!keywordSchema || !field || !model || !_idField_ || typeof _idValue == 'undefined') {
    done && done(new Error('schema@keywords parameter error'))
    return false
  }

  client.smembers(keywordSchema, function(err, members) {
    if (err) {
      console.error(err)
      done && done(err)
      return
    }

    var multi = client.multi()

    for (var i = 0; i < members.length; i++) {
      var key     = keywordSchema + ':' + members[i]

      typeof score == 'undefined'
        ? multi.srem(key, _idValue)
        : multi.zrem(key, _idValue)
    }

    if (operator != 'remove' && value) {
      var keywords = value.split(',')
      for (var j = 0; j < keywords.length; j++) {
        var keyword = keywords[j]
        if (keyword) {
          key = keywordSchema + ':' + keyword

          multi.sadd(keywordSchema, keyword)

          typeof score == 'undefined'
            ? multi.sadd(key, _idValue)
            : multi.zadd(key, score, _idValue)
        }
      }
    }

    //console.log(multi.queue)

    multi.exec(function (err, replies) {
      if (err) {
        console.error(err)
        done && done(err)
        return
      }

      done && done()
    })
  })

  return null
}


/*
根据schema更瓣target对象内容
*/
var filter = function(schemaName, target, cb, options) {
  options = options || {}

  var schema   = SCHEMA[schemaName]
    , FUNCS    = options.FUNCS || FILTERS
    , operator = options.operator
    , flag     = true

  if (!schema) {
    console.error("doesn't found schema", schemaName)
    return target
  }

  var fields  = Object.keys(target)

  /*
  回调计数变量
  */
  var cbCur = 0
    , cbLen = 0

  var doneHandler = function(err, result) {
    if (err || result === false) {
      flag = false
      cb && cb(err, flag)
      //确保只执行一次; 可否优化？
      cb = null
    }

    if (flag) {
      if (++cbCur >= cbLen) {
        cb && cb(null, flag)
        //确保只执行一次
        cb = null
      } 
    }
  }

  for (var i = 0; i < fields.length; i++) {
    //例如: username => { require:[], minlen:[4] }
    var field = fields[i]
      , rules = schema[field]

    if (typeof rules == 'undefined') {
      delete target[field]
    } else {
      var value = target[field]
        , names = Object.keys(rules)  //require, min, max

      /*
      custom filter functions
      */
      for (var j = 0; j < names.length; j++) {

        //左括号连同函数名存在
        var name = names[j]
          , func = FUNCS[name]
          , args = rules[name]

        //对象规则参数都存在
        if (func && args) {
          //将function对象参数绑定当前model对象执行
          for (var k = 0; k < args.length; k++) {
            var arg = args[k]
            if (arg instanceof Function) {
              args[k] = arg.apply(target)
            }
          }


          /*
          将当前filter/value/model当成参数传入
          */
          var funcContext = {
              field     : field
            , value     : target[field]
            , model     : target
            , operator  : operator
            , schema    : schemaName
            , done      : doneHandler
          }


          var result = func.apply(funcContext, args)

          /*
          result 可能的返回结果: true/false/undefined/null
          直接返回是false说明插入不成功，验证未通过
          */
          if (result === false) {
            console.log('schema@' + schemaName + ' ' + field + ':' + name + ' return false, ' + value)
            flag = false
          }

          /*
          返回null表明是异步的，filter没有做完，有回调需要处理，传入回调确认函数done
          */
          else if (result === null) {
            /* 待处理回调+1 */
            cbLen++
          }
        }
      }
    }
  }

  //如果刚开始就相等：如为零，则执行回调
  cbCur == cbLen && cb && cb(null, flag)

  return flag;
}


/*
更新依赖update dependency：schema中的自定义函数如index等
带括号即为函数，括号跟函数不得有空格
如index('user_slide')
此时不做合法性验证，会更新相关数据库
}
*/
var relate = function(schemaName, target, cb) {
  filter(schemaName, target, cb, { FUNCS: COMMANDS })
}

/*
delete is taken by javascript rename to remove
*/
var removeRelate = function(schemaName, target, cb) {
  filter(schemaName, target, cb, { FUNCS: COMMANDS, operator: 'remove' })
}


/*
通过where提供的条件选取schemaName中的元素,
*/
var select = function(schemaName, where, cb, options) {
  if (arguments.length < 2) {
    cb && cb(new Error('select error: invalid params'))
    return
  }

  /*
  No where provider?
  */
  else if (where instanceof Function) {
    options = cb
    cb      = where
    where   = {}
  }

  options = options || {}

  var schema      = SCHEMA[schemaName]
    , conditions  = Object.keys(where)
    , count1      = 0
    , count2      = 0


  var getFromIDs = function(objectIDs) {
    /*
    集合ID为空，直接返回
    */
    if (objectIDs.length < 1) {
      cb && cb(null, [])
      return
    }

    /*
    将交集集合提取元素
    */
    var count2   = 0
      , objects = []


    var isAllDone = function(err) {
      if (err) {
        console.error(err)
      }

      if (++count2 == objectIDs.length) {
        //如果是删除操作符，则只返回受影响行数
        if (options.operator == 'remove') {
          cb && cb(null, count2)
        } else {
          cb && cb(null, objects)
        }
      }
    }

    var getObject = function(id) {
      var key = schemaName + ':' + id

      var onRemoveRelate = function(err, result) {
        if (err) {
          console.error(err)
        }

        client.del(key, isAllDone)
      }

      var onGetAll = function(err, object) {
        if (err) {
          console.error(err)
        } else if (options.operator == 'remove') {
          removeRelate(schemaName, object, onRemoveRelate)
          //Avoid isAllDone execute twice
          return
        } else {
          objects.push(object)
        }

        isAllDone()
      }

      client.hgetall(key, onGetAll)
    }

    objectIDs.forEach(getObject)
  }


  /*
  ********************************************************
  CASE 1: 有序集合和无序集合，相互交集，分别查询出列表，并将所有集合并求其交集
  ********************************************************
  */
  var resultHandler = function(results) {
    /*
    将所有集合求其交集; 第一个集合是最小的数组
    */
    results.sort(function(a, b) {
      a.length - b.length
    })

    var firstArr  = results[0].length
      , objectIDs = []

    for (var i = 0; i < results[0].length; i++) {
      var item = results[0][i]
        , flag = true

      for (var j = 1; j < results.length; j++) {
        if (results[j].indexOf(item) < 0) {
          flag = false
          j = results.length
        }
      }

      flag && objectIDs.push(item)
    }

    getFromIDs(objectIDs)
  }

  /*
  将where中的每个条件的集合提取出来；如果全部条件均为set则可使用inter, union等连接查询指令
  */
  var multi = client.multi()
    , skeys = []
    , isSet = true

  var conditionHandler = function(condition) {
    count1++

    /*
    查询的字段在schema中有无定义
    condition: email
    rules:     { shown: [], email: [], minlen: [ '4' ], maxlen: [ '32' ], require: [], index: [ 'user_email' ] }
    */
    var rules = schema[condition]
    if (!rules) {
      return console.error('select error ' + schemaName + ':' + condition + ' is not defined in schema')
    }

    /*
    若是ID字段则无需根据索引字段查找出ID， where[condition]的值即为ID
    */
    if (rules.id) {
      var idArr = [ where[condition] ]
      isSet = false
    } else {
      //只有index或keywords属性才能让where条件起作用
      var conditionSchema = rules.index || rules.keywords
      if (!conditionSchema) {
        return console.error('select error ' + schemaName + ':' + condition + ' is not an index field') 
      }

      var conditionKey = conditionSchema[0] + ':' + where[condition]

      //schema中只有一个参数为无序集合(set); 两个参数则为有序集合(sorted set)
      if (conditionSchema.length > 1) {
        multi.zrange(conditionKey, 0, 10000)
        isSet = false
      } else {
        multi.smembers(conditionKey)
        isSet && skeys.push(conditionKey)
      }
    }


    if (count1 == conditions.length) {
      /*
      返回的是一个纯set类型的二维数组，使用内置函数求其交集or并集
      results: [ ['airjd'], ['kris', 'airjd'] ]
      */
      if (isSet) {
        multi.discard()
        skeys.push(function(err, IDs) {
          if (err) {
            cb && cb(err)
            return
          }

          getFromIDs(IDs)
        })

        client.sinter.apply(client, skeys)
      }

      /*
      返回的是一个类型多样的含ID的二维数组，求其交集or并集？先从少到多排列，减少比较次数
      results: [ ['airjd'], ['kris', 'airjd'] ]
      */
      else {
        multi.exec(function(err, results) {
          if (err) {
            cb && cb(err)
            return
          }

          idArr && results.push(idArr)
          resultHandler(results)
        })
      }
    }
  }

  if (conditions.length < 1) {
    client.keys(schemaName + ':*', function(err, keys) {
      if (err) {
        cb && cb(err)
        return
      }

      if (keys && keys.length) {
        var prefix = schemaName + ':'
        for (var i = 0; i < keys.length; i++) {
          keys[i] = keys[i].replace(prefix, '')
        }
      }

      resultHandler([keys])
    })
  } else {
    conditions.forEach(conditionHandler)
  }
}


/*
更新传进来的target
target若存在ID字段, 则以此ID进行更新否则新添加一条记录
*/
var update = function(schemaName, target, cb, operator) {
  var schema  = SCHEMA[schemaName]
    , idField = schema._idField_
    , id      = target[idField]

  if (typeof id == 'undefined') {
    cb && cb(new Error('update ' + schemaName + ' failed: ID is not exist'))
    return
  }

  filter(schemaName, target, function(err, result) {
    if (err || result === false) {
      cb && cb(err || new Error('update ' + schemaName + ' failed: invalid field value'))
      return
    }

    client.hmset(schemaName + ':' + id, target, function(err) {
      if (err) {
        cb && cb(err)
        return
      }

      filter(schemaName, target, cb, { FUNCS: COMMANDS, operator: operator })
    })
  }, { FUNCS: FILTERS, operator: operator })
}


/*
新添加一条记录，会判断id/unique字段是否符合唯一性条件
*/
var insert = function(schemaName, target, cb) {
  update(schemaName, target, cb, 'insert')
}


/*
复用select现有的查询条件
*/
var remove = function() {
  var args = Array.prototype.slice.call(arguments)
  args.push({ operator: 'remove' })
  select.apply(this, args)
}


/*
formatter
*/
var parse = function(schemaName, target) {
  var schema  = SCHEMA[schemaName]._schema_

  if (!schema) {
    console.error("doesn't found schema", schemaName)
    return
  }

  for (var key in target) {
    var rule  = schema[key]
      , value = target[key]
      , type  = typeof value

    if (rule.indexOf('int')) {
      target[key] = parseInt(value) || 0
    }

    else if ((rule.indexOf('array') > -1 || rule.indexOf('json') > -1) && type == 'string') {
      try {
        target[key] = JSON.parse(value || '{}')
      } catch (e) {
        console.error(schemaName, target, e)
        return
      }
    }
  }

  return target
}



var stringify = function(schemaName, target) {
  var schema  = SCHEMA[schemaName]._schema_

  if (!schema) {
    console.error("doesn't found schema", schemaName)
    return
  }

  for (var key in target) {
    var rule  = schema[key]
      , value = target[key]
      , type  = typeof value

    if ((rule.indexOf('array') > -1 || rule.indexOf('json') > -1) && type == 'object' && value) {
      try {
        target[key] = JSON.stringify(value)
      } catch (e) {
        console.error(schemaName, target, e)
        return
      }
    }
  }

  return target
}




var define = Object.defineProperty

var redblade = {
    init          : init
  , notify        : notify
  , SCHEMA        : SCHEMA
  , schema        : schema
  , filter        : filter
  , relate        : relate
  , removeRelate  : removeRelate
  , parse         : parse
  , stringify     : stringify
  , select        : select
  , update        : update
  , remove        : remove
  , insert        : insert
}




define(redblade, 'client', { get: function() {
  return client
}})




module.exports = redblade
