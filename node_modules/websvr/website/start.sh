#!/bin/bash
echo start sitetest

#change current dir, in order to call it from anywhere.
cd $(dirname $0)

while true; do
  node svr/sitetest.js

  echo ***************************************
  echo Server stop working, restarting...
  echo ***************************************

  #wait 2 seconds
  sleep 2
done