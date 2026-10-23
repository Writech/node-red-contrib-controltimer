#!/bin/bash

PACKAGE_NAME="${npm_package_name:-$(npm pkg get name | tr -d '"')}"
NODE_RED_CONTAINER_NAME="node-red-testing"
NODE_RED_IMAGE_NAME="nodered/node-red:4.1.17-22"

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
NODE_RED_DATA_DIR="$REPO_DIR/.node-red"

mkdir -p "$NODE_RED_DATA_DIR"
[ -f "$NODE_RED_DATA_DIR/package.json" ] || echo '{"name":"node-red-dev","version":"0.0.0","private":true}' > "$NODE_RED_DATA_DIR/package.json"
NODE_RED_PORT=1880
[ -f "$NODE_RED_DATA_DIR/flows.json" ] || cp "$REPO_DIR/examples/controltimer-example-flow.json" "$NODE_RED_DATA_DIR/flows.json"
cp "$REPO_DIR/scripts/node-red/settings.js" "$NODE_RED_DATA_DIR/settings.js"
