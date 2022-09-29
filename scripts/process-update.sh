#!/bin/env sh
killall chromium-browser
DISPLAY=:0 chromium-browser --start-fullscreen --start-maximized http://localhost:5000
