#!/bin/bash

PACKAGE_NAME="${npm_package_name:-$(npm pkg get name | tr -d '"')}"
NODE_RED_CONTAINER_NAME="node-red-testing"
NODE_RED_IMAGE_NAME="nodered/node-red:3.0.2-14"
