#!/bin/env sh
npm install --production
sudo pm2 restart index
killall firefox-esr
$(dirname $0)/launch-hub.sh
