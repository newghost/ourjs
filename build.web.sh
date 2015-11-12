#!/bin/bash
#display commands
set -x


#将css和js合并压缩

TARGET='./web'

mkdir   $TARGET/tmp

node ./tools/combiner   $TARGET/style.part
node ./tools/combiner   $TARGET/script.part

node ./tools/minifier $TARGET/css/prod.min.css       $TARGET/tmp/prod.min.css
node ./tools/minifier $TARGET/js/prod.min.js         $TARGET/tmp/prod.min.js

mv $TARGET/tmp/prod.min.css         $TARGET/css/prod.min.css
mv $TARGET/tmp/prod.min.js          $TARGET/js/prod.min.js

rm -rf $TARGET/tmp

sleep 30