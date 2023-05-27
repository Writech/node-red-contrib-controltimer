#!/bin/bash

concurrently \
    --names "NODE-RED,REINSTALL" \
    --prefix-colors "bgRed,bgBlue" \
    "npm run node-red:start-docker" \
    "nodemon --watch src --ext ts,ejs,png --exec 'npm run node-red:reinstall-package'"
