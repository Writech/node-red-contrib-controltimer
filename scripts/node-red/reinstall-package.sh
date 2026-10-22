#!/bin/bash
source "$(dirname "$0")/_variables.sh"

REPO_DIR="$(cd "$(dirname "$0")/../.." && pwd)"

echo "### Changes detected. Re-applying changes. ###" && \
npm run build && \
npm pack && \
cd ~/.node-red && \
npm uninstall --save "$PACKAGE_NAME" && \
npm install --save "$REPO_DIR"/"$PACKAGE_NAME"-*.tgz && \
docker restart "$NODE_RED_CONTAINER_NAME" && \
echo "### Changes applied. ###"
