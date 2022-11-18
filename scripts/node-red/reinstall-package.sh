#!/bin/bash
source ./scripts/_utils/_variables.sh

npm run build && \
cd ~/.node-red && \
npm uninstall --save $PACKAGE_JSON_NAME && \
npm install --save "~/GithubProjects/$PACKAGE_JSON_NAME/$PACKAGE_ARCHIVE_FILENAME" && \
docker restart $NODE_RED_CONTAINER_NAME
