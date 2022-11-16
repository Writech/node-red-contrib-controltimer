#!/bin/bash

PACKAGE_JSON_NAME=$(node -p "require('./package.json').name")
PACKAGE_JSON_VERSION=$(node -p "require('./package.json').version")
PACKAGE_ARCHIVE_FILENAME="$PACKAGE_JSON_NAME-$PACKAGE_JSON_VERSION.tgz"
NODE_RED_CONTAINER_NAME="node-red-testing"
NODE_RED_IMAGE_NAME="nodered/node-red:3.0.2-16"
