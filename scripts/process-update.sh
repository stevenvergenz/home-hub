#!/bin/env sh
pm2 restart index
killall chromium-browser
DISPLAY=:0 chromium-browser --start-fullscreen http://localhost
