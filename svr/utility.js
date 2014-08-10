/*!@preserve
* OurJS     : Free Blog Engine, Forum System, Website Template and CMS Platform based on Node.JS
* Copyright : Kris Zhang <kris.newghost@gmail.com>
* Homepage  : http://code.ourjs.com
* Project   : https://github.com/newghost/ourjs
* License   : BSD
*/

var crypto          = require('crypto')
  , config          = global.CONFIG
  , GENERAL_CONFIG  = config.GENERAL_CONFIG
  ;

var utility = {};

//extend object to target
utility.extend = function(tar, obj) {
  if (!obj) return;

  for (var key in obj) {
    tar[key] = obj[key];
  }

  return tar;
};

//merge from json to target
utility.merge = function(tar, from) {
  if (!tar || !from) return;

  for (var key in from) {
    typeof tar[key] == 'undefined' && (tar[key] = from[key]);
  }

  return tar;
};

utility.encode = function(str) {
  str = str.replace('>', '&gt;');
  str = str.replace('<', '&lt;');
  return str;
};

utility.decode = function(str) {
  str = str.replace('&gt;', '>');
  str = str.replace('&lt;', '<');
  return str;
};

//remove all the \r\n and <br>
utility.inline = function(str) {
  str = str || "";
  str = str.replace(/[\r\n]/g, '');
  str = str.replace(/<br>/g, '');
  return str;
};

utility.addTag = function(url) {
  url = url || "";
  if (url && url.indexOf("utm_source=ourjs.com") < 1) {
    url += (url.indexOf("?") > 0 ? "&utm_source=ourjs.com" : "?utm_source=ourjs.com");
  }
  return url;
};

utility.getPureUrl = function(url) {
  url = url || '';
  var idx = url.indexOf('?');
  idx > -1 && (url = url.substr(0, idx));
  return url;
};

utility.text = function(html) {
  var html = html.replace(/<[\w\d\_\-\/\'\"\=\:\ \.\(\)\,\?\&\;\+\%]*>/g, '');
  html = html.replace(/[\ \r\n\t]+/g, '');
  return html;
};

utility.description = function(html) {
  return utility.text(html).substr(0, 140);
};

utility.md5 = function(text) {
  return crypto.createHash('md5').update(text || '').digest('hex');
};

utility.getObjectIDFromTime = function(time) {
  time = time ? new Date(time) : new Date();
  var hex = (time/1000 | 0).toString(16);
  var object = hex + "0000000000000000";
  return object;
};

utility.getTimeFromObjectID = function(objectid) {
  var date
    , objectid = objectid.toString()
    ;

  if (objectid.length != 24) {
    date = new Date();
  } else {
    date = new Date(parseInt(objectid.slice(0, 8), 16) * 1000);
  }

  return date;
};

utility.getTimestamp = function(objectid) {
  var date = utility.getTimeFromObjectID(objectid || '');

  return (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear();
};

utility.getTimestampFromDate = function(date) {
  var date = new Date(parseInt(date)) || new Date();

  return (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear();
};


/*
bcrypt need some dependency on Windows, so use crypto
*/
utility.getEncryption = function(str) {
  var cipher = crypto.createCipher('aes256', GENERAL_CONFIG.CRYPTOKEY);  
  var encrypted = cipher.update(str, 'utf8', 'hex') + cipher.final('hex');
  return encrypted;
};

module.exports = utility;