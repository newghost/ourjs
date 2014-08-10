/*!@preserve
* OurJS     : Free Blog Engine, Forum System, Website Template and CMS Platform based on Node.JS
* Copyright : Kris Zhang <kris.newghost@gmail.com>
* Homepage  : http://code.ourjs.com
* Project   : https://github.com/newghost/ourjs
* License   : BSD
*/

var config      = global.CONFIG
  , categories  = config.CATEGORIES
  , keywords    = config.KEYWORDS
  , MESSAGES    = config.MESSAGES
  ;

var categoryOpts
  , keywordsOpts
  ;


require('../lib/string.js')();

(function() {
  categoryOpts = '';

  for (var key in categories) {
    if (key) {
      categoryOpts += '<option value="{0}">{0}</option>'.format(key);
    }
  }

  keywordsOpts = '';
  for (var keyword in keywords) {
    keyword && (keywordsOpts += '<option value="{0}">{0}</option>'.format(keyword));
  }

})();

module.exports = {
    categories    : categories
  , categoryOpts  : categoryOpts
  , keywords      : keywords
  , keywordsOpts  : keywordsOpts
};