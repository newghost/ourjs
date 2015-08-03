#!/bin/bash
#display commands
set -x

SOURCE='./newspaper/*'
TARGET='./newspaper.min'

mkdir   $TARGET
mkdir   $TARGET/tmp

cp -rf  $SOURCE $TARGET

node ../tools/combiner   $TARGET/script.part   -r
node ../tools/combiner   $TARGET/style.part    -r

node ../tools/minifier $TARGET/css/libs.min.css       $TARGET/tmp/libs.min.css
node ../tools/minifier $TARGET/css/prod.min.css       $TARGET/tmp/prod.min.css

node ../tools/minifier $TARGET/js/libs.min.js         $TARGET/tmp/libs.min.js
node ../tools/minifier $TARGET/js/prod.min.js         $TARGET/tmp/prod.min.js

rm -rf $TARGET/css/*.css
rm -rf $TARGET/js/*.js

mv $TARGET/tmp/libs.min.css         $TARGET/css/libs.min.css
mv $TARGET/tmp/prod.min.css         $TARGET/css/prod.min.css
mv $TARGET/tmp/libs.min.js          $TARGET/js/libs.min.js
mv $TARGET/tmp/prod.min.js          $TARGET/js/prod.min.js

sleep 30