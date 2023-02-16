#!/bin/env sh
npm install --production
sudo pm2 restart index
killall chromium-browser
DISPLAY=:0 nohup chromium-browser --kiosk --app=http://localhost:5000 &> /dev/null &
