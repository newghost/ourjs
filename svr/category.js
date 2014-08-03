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