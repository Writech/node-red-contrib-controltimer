#!/bin/bash
source ./scripts/_utils/_variables.sh

docker ps --quiet --filter "name=$NODE_RED_CONTAINER_NAME" | xargs --no-run-if-empty docker stop # stop running container
docker ps --all --quiet --filter "name=$NODE_RED_CONTAINER_NAME" | xargs --no-run-if-empty docker rm # remove existing container
