echo "start ourjs"

:dowhile

    node ./svr/ourjs.js config.newspaper.js

    ping -n 1 127.0.0.1 >nul
    REM "Server stop working, waiting for restart...\r\n\r\n\r\n\r\n"

goto :dowhile