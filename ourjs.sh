#!/bin/bash
echo "start ourjs"

#change current dir, in order to call it from anywhere.
cd $(dirname $0)

while true; do
  {
    node ./svr/ourjs.js config.js

    echo "Server stop working, waiting for restart...\r\n\r\n\r\n\r\n"
    sleep 5

  #启用输出运行错误到本目录的 error.log 文件， 请将"#"移除
  } #2>> ./error.log
done
