#!/bin/env sh
npm install --production
sudo pm2 restart index
killall chromium-browser
killall firefox-esr
DISPLAY=:0 nohup firefox-esr -kiosk -private-window http://localhost:5000 &> /dev/null &
