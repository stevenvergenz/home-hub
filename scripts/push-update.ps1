rm -recurse build/*, serverBuild/*
npm run build
scp -r config.json package.json package-lock.json scripts/ build/ serverBuild/ steven@192.168.1.52:/home/steven/home-hub
ssh steven@192.168.1.52 'chmod +x /home/steven/home-hub/scripts/process-update.sh && /home/steven/home-hub/scripts/process-update.sh'
