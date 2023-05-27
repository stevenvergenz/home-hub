#!/bin/env sh
rm -r build/* serverBuild/*
npm run build
scp -r config.json package.json package-lock.json scripts/ build/ serverBuild/ steven@192.168.1.151:/home/steven/home-hub
ssh steven@192.168.1.151 'chmod +x /home/steven/home-hub/scripts/*.sh && /home/steven/home-hub/scripts/process-update.sh'
