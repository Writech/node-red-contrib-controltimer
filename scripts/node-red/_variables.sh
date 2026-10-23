#!/bin/bash

PACKAGE_NAME="${npm_package_name:-$(npm pkg get name | tr -d '"')}"
NODE_RED_CONTAINER_NAME="node-red-testing"
NODE_RED_IMAGE_NAME="nodered/node-red:4.1.17-22"
NODE_RED_PORT=1880

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
NODE_RED_DATA_DIR="$REPO_DIR/.node-red"
