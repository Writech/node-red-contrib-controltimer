#!/bin/bash
source "$(dirname "$0")/_variables.sh"
source "$(dirname "$0")/_require-docker.sh"

docker ps --quiet --filter "name=$NODE_RED_CONTAINER_NAME" | xargs --no-run-if-empty docker stop # stop running container
docker ps --all --quiet --filter "name=$NODE_RED_CONTAINER_NAME" | xargs --no-run-if-empty docker rm # remove existing container
