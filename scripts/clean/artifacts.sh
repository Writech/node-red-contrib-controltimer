#!/bin/bash
source ./scripts/_utils/_variables.sh

npx rimraf dist tsconfig.tsbuildinfo package "$PACKAGE_JSON_NAME-*.tgz"
