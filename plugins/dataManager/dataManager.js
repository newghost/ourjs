/*!@preserve
* OurJS     : Free Blog Engine, Forum System, Website Template and CMS Platform based on Node.JS
* Copyright : Kris Zhang <kris.newghost@gmail.com>
* Homepage  : http://code.ourjs.com
* Project   : https://github.com/newghost/ourjs
* License   : BSD
*/

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
* is admin? Link to next filter or reponse end
*/
webSvr.filter('/admin/', function(req, res) {
  var username  = req.session.get('username')
    , loginUser = Users.users[username] || {}
    ;

  if (!loginUser.isAdmin) {
    res.end(MESSAGES.NOPERMISSION);
  } else {
    req.filter.next();
  }
});


var sort = function(a, b) {
  return parseInt((b._id.toString() || '').slice(0, 8), 16) - parseInt((a._id.toString() || '').slice(0, 8), 16);
};


webSvr.url('/admin/data/:schema/select/:pager', function(req, res) {
  var username  = req.session.get('username')
    , schema    = req.params.schema
    , pager     = req.params.pager || 0
    , pageSize  = 1000
    , MODEL     = DATA_MODELS[schema]
    ;

  if (MODEL) {
    //Load schema
    try {
      var schemaInfo  = SCHEMA[schema];
    } catch(err) {
      res.end(MESSAGES.SCHEMA_NOT_FOUND);
      return console.log(err);
    }

    //Pickup shown properties
    var properties = [];
    for (var property in schemaInfo) {
      if (schemaInfo[property].indexOf('shown') > -1) {
        properties.push(property);
      }
    };

    adapter.select(schema, function(list) {
      var outputs = list.sort(sort).slice(pager * pageSize, (pager + 1) * pageSize);
      res.render('/plugins/dataManager/web/list.tmpl', { docs: outputs, username: username, schema: schema, properties: properties });
    });
  } else {
    res.end(MESSAGES.NOPERMISSION);
  }
});


webSvr.url('/admin/data/:schema/edit/:id', function(req, res) {
  var username  = req.session.get('username')
    , schema    = req.params.schema
    , id        = req.params.id
    ;

  try {
    var schemaInfo  = SCHEMA[schema]
  } catch (err) {
    res.end(MESSAGES.SCHEMA_NOT_FOUND);
    return console.log(err);
  }

  if (id === 'add') {
    res.render('/plugins/dataManager/web/edit.tmpl', { doc: {}, schema: schema, SCHEMA: schemaInfo, username: username });
  } else {
    adapter.select(id, schema, function(docs) {
      if (!docs || docs.length < 1) {
        res.end('data not found, ' + schema + ', ' + id);
        return;
      }
      res.render('/plugins/dataManager/web/edit.tmpl', { doc: docs[0], schema: schema, SCHEMA: schemaInfo, username: username });
    });
  }
});


/*
*
*/
webSvr.url('/admin/data/:schema/edit.post', function(req, res) {
  var username  = req.session.get('username')
    , schema    = req.params.schema
    , doc       = req.body
    ;

  if (DATA_MODELS[schema] && doc) {
    doc._id
      ? adapter.update(doc._id, schema, doc, function(result) {
          !result && res.writeHead(401);
      })
      : adapter.insert(schema, doc, function(result) {
          !result && res.writeHead(401);
      });
  } else {
    res.writeHead(401);
  }
  res.end();

}, 'json');