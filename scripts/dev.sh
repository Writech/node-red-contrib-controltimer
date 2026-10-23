#!/bin/bash
source "$(dirname "$0")/node-red/_require-docker.sh"
source "$(dirname "$0")/node-red/_variables.sh"

docker image inspect "$NODE_RED_IMAGE_NAME" > /dev/null 2>&1 || docker pull "$NODE_RED_IMAGE_NAME" || exit 1

trap 'echo "### Stopping Node-RED container. ###"; npm run --silent node-red:stop-docker' EXIT

concurrently \
    --names "NODE-RED,REINSTALL" \
    --prefix-colors "bgRed,bgBlue" \
    "npm run node-red:start-docker" \
    "nodemon --watch src --ext ts,ejs,png --exec 'npm run node-red:reinstall-package'"
