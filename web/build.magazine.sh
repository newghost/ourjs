#!/bin/bash
#display commands
set -x

THEME='./magazine'

cd $THEME/js
cat jquery.js modernizr.js foundation.min.js medium-editor.js classList.js jquery.cookie.js > libs.js
cat ../../../lib/string.js ourjs.js > prod.js
cd ../../

cd $THEME/css
cat normalize.css foundation.min.css font-awesome.css > libs.css
cat medium-editor-default.css medium-editor.css ourjs.css > prod.css
cd ../../

node ../tools/minifier $THEME/css/prod.css          $THEME/css/prod.min.css
node ../tools/minifier $THEME/css/libs.css          $THEME/css/libs.min.css
node ../tools/minifier $THEME/js/libs.js            $THEME/js/libs.min.js
node ../tools/minifier $THEME/js/prod.js            $THEME/js/prod.min.js


sleep 30