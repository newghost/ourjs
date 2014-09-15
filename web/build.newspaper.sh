#!/bin/bash
#display commands
set -x

THEME='./newspaper'

cd $THEME/js
cat jquery.min.js bootstrap.min.js wysihtml5.js > libs.js
cat jquery.validate.js jquery.cookie.js bootstrap-wysihtml5.js Markdown.Converter.js Markdown.Sanitizer.js Markdown.Editor.js Markdown.local.cn.js ../../../lib/string.js jquery.browser.js nprogress.js ourjs.js > prod.js
cd ../../

cd $THEME/css
cat bootstrap.css > libs.css
cat bootstrap-wysihtml5.css ourjs.css > prod.css
cd ../../

node ../tools/minifier $THEME/css/bootstrap.css     $THEME/css/bootstrap.min.css
node ../tools/minifier $THEME/css/prod.css          $THEME/css/prod.min.css
node ../tools/minifier $THEME/css/libs.css          $THEME/css/libs.min.css
node ../tools/minifier $THEME/css/ie7.css           $THEME/css/ie7.min.css
node ../tools/minifier $THEME/js/libs.js            $THEME/js/libs.min.js
node ../tools/minifier $THEME/js/bootstrap.js       $THEME/js/bootstrap.min.js
node ../tools/minifier $THEME/js/prod.js            $THEME/js/prod.min.js


sleep 30