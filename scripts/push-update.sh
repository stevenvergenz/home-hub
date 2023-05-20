#!/bin/env sh
rm -r build/* serverBuild/*
npm run build
scp -r config.json package.json package-lock.json scripts/ build/ serverBuild/ steven@dashboard.vergenz.home:/home/steven/home-hub
ssh steven@dashboard.vergenz.home 'chmod +x /home/steven/home-hub/scripts/*.sh && /home/steven/home-hub/scripts/process-update.sh'
