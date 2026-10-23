#!/bin/bash
source "$(dirname "$0")/_variables.sh"
source "$(dirname "$0")/_require-docker.sh"

echo "### Changes detected. Re-applying changes. ###" && \
npm run build && \
npm pack && \
([ -d "$NODE_RED_DATA_DIR/node_modules/@node-red-contrib-themes/theme-collection" ] \
    || npm --prefix "$NODE_RED_DATA_DIR" install --save @node-red-contrib-themes/theme-collection@3.1.11) && \
npm --prefix "$NODE_RED_DATA_DIR" uninstall --save "$PACKAGE_NAME" && \
npm --prefix "$NODE_RED_DATA_DIR" install --save "$REPO_DIR"/"$PACKAGE_NAME"-*.tgz && \
(docker ps --quiet --filter "name=$NODE_RED_CONTAINER_NAME" | grep -q . \
    && docker restart "$NODE_RED_CONTAINER_NAME" \
    || echo "Container not running yet, it will load the package on start.") && \
echo "### Changes applied. ###"
