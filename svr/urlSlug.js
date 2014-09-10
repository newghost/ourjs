/*
* Users Cache
*/
var config          = global.CONFIG
  , GENERAL_CONFIG  = config.GENERAL_CONFIG
  , Articles        = global.Articles
  , urlSlugMethods  = {}


urlSlugMethods.FORMAT_TITLE = function(article) {
  var slug = (article.title || '').toLowerCase().replace(/[^\w\u4e00-\u9fa5]+/g, '-')

  if (slug) {
    var existArticle = Articles.urlSlugsArticles[slug]
    //avoid duplicate
    if (existArticle && existArticle._id != article._id) {
      slug += '-'
    }

    article.urlSlug = slug

    return true
  }

  return false
}

var urlSlug = function(article) {
  if (typeof article !== 'object') {
    return false
  }

  var slugMethod = urlSlugMethods[GENERAL_CONFIG.urlSlug]

  return slugMethod && slugMethod(article)
}

module.exports = urlSlug