#!/bin/bash

npm run node-red:start-docker&& \
nodemon --watch src --ext ts,tsx,ejs,png --exec 'npm run node-red:reinstall-package'

