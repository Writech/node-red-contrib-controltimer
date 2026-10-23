#!/bin/bash
# Creates the local Node-RED data dir (.node-red/) and seeds it. Source _variables.sh first.

mkdir -p "$NODE_RED_DATA_DIR"
[ -f "$NODE_RED_DATA_DIR/package.json" ] || echo '{"name":"node-red-dev","version":"0.0.0","private":true}' > "$NODE_RED_DATA_DIR/package.json"
[ -f "$NODE_RED_DATA_DIR/flows.json" ] || cp "$REPO_DIR/examples/controltimer-example-flow.json" "$NODE_RED_DATA_DIR/flows.json"
cp "$REPO_DIR/scripts/node-red/settings.js" "$NODE_RED_DATA_DIR/settings.js"
