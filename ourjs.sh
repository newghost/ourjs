#!/bin/bash
echo "start ourjs"

#change current dir, in order to call it from anywhere.
cd $(dirname $0)

while true; do
  {
    node ./svr/ourjs.js config.js

    echo "Server stop working, waiting for restart...\r\n\r\n\r\n\r\n"
    sleep 5
  } #2>> ./error.log
done
