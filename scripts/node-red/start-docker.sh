#!/bin/bash
source "$(dirname "$0")/_variables.sh"
source "$(dirname "$0")/_require-docker.sh"

npm run node-red:stop-docker && \
docker run \
    --detach `#Run container in background and print container ID` \
    --rm `#Automatically remove the container when it exits` \
    --publish $NODE_RED_PORT:1880 `#Publish a container's port(s) to the host` \
    --volume "$NODE_RED_DATA_DIR":/data `#Bind mount a volume`  \
    --name $NODE_RED_CONTAINER_NAME `#Assign a name to the container` \
    $NODE_RED_IMAGE_NAME && \
echo "### Node-RED is starting, open http://localhost:$NODE_RED_PORT in your browser. ###"
