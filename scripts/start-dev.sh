#!/bin/bash

#npm run node-red:start-docker & nodemon --watch "./src" --exec "npm run node-red:reinstall-package"

concurrently --names "NODE-RED,REINSTALL" --prefix-colors "bgRed,bgBlue" "npm run node-red:start-docker" "nodemon --watch src --ext ts,ejs,png --exec 'npm run node-red:reinstall-package'"
