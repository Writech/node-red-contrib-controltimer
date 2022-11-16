#!/bin/bash

NODE_RED_CONTAINER_NAME = 'node-red-testing'
NODE_RED_IMAGE_NAME = 'nodered/node-red:3.0.2-16'

npm run node-red:stop-docker && \
docker run $NODE_RED_IMAGE_NAME \
    --detach \  # Run container in background and print container ID
    --rm \  # Automatically remove the container when it exits
    --publish 1880:1880 \  # Publish a container's port(s) to the host
    --volume ~/.node-red:/data \  # Bind mount a volume
    --name $NODE_RED_CONTAINER_NAME  # Assign a name to the container
