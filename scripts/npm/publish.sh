#!/bin/bash
source ./scripts/_utils/_variables.sh

npm run clean:all && \
npm install && \
npm run tidy:format && \
npm run build && \
npm publish $PACKAGE_ARCHIVE_FILENAME --dry-run
