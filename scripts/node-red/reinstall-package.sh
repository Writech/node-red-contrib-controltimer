#!/bin/bash
source "$(dirname "$0")/_variables.sh"
source "$(dirname "$0")/_require-docker.sh"
source "$(dirname "$0")/_prepare-data-dir.sh"

TARBALL_DIR="$(mktemp -d)"
trap 'rm -rf "$TARBALL_DIR"' EXIT

echo "### Changes detected. Re-applying changes. ###" && \
npm run build && \
TARBALL="$TARBALL_DIR/$(npm pack --silent --pack-destination "$TARBALL_DIR" | tail -1)" && \
([ -d "$NODE_RED_DATA_DIR/node_modules/@node-red-contrib-themes/theme-collection" ] \
    || npm --prefix "$NODE_RED_DATA_DIR" install --save @node-red-contrib-themes/theme-collection@3.1.11) && \
npm --prefix "$NODE_RED_DATA_DIR" uninstall --no-save "$PACKAGE_NAME" && \
npm --prefix "$NODE_RED_DATA_DIR" install --no-save "$TARBALL" && \
(docker ps --quiet --filter "name=$NODE_RED_CONTAINER_NAME" | grep -q . \
    && docker restart "$NODE_RED_CONTAINER_NAME" \
    || echo "Container not running yet, it will load the package on start.") && \
echo "### Changes applied. ###"
