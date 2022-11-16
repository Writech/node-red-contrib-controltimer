#!/bin/bash

nodemon --watch "./src" --exec "npm run node-red:reinstall-package" && npm run node-red:start-docker
