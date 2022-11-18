#!/bin/bash
source ./scripts/_utils/_variables.sh

npx rimraf dist package $PACKAGE_ARCHIVE_GLOB_FILENAME && \
ts-node-esm ./scripts/typescript/clean-npm.mts
