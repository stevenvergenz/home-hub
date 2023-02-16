rm -recurse build/*, serverBuild/*
npm run build
scp -r config.json package.json package-lock.json scripts/ build/ serverBuild/ steven@192.168.1.25:/home/steven/home-hub
ssh steven@192.168.1.25 'chmod +x /home/steven/home-hub/scripts/process-update.sh'
ssh steven@192.168.1.25 '/home/steven/home-hub/scripts/process-update.sh'
