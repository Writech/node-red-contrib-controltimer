#!/bin/bash
source ./scripts/_utils/_variables.sh

npm run node-red:stop-docker && \
docker run \
    --detach `#Run container in background and print container ID` \
    --rm `#Automatically remove the container when it exits` \
    --publish 1880:1880 `#Publish a container's port(s) to the host` \
    --volume ~/.node-red:/data `#Bind mount a volume`  \
    --name $NODE_RED_CONTAINER_NAME `#Assign a name to the container` \
    $NODE_RED_IMAGE_NAME
