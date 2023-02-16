#!/bin/env sh

# wait for server to start
curl -s http://localhost:5000 > /dev/null
exitCode=$?
while [ $exitCode -ne 0 ]; do
	sleep 5
	curl -s http://localhost:5000 > /dev/null
	exitCode=$?
done

DISPLAY=:0 nohup firefox-esr -kiosk -private-window http://localhost:5000 &> /dev/null &
