#!/bin/bash

# Runs the integration tests against several Node-RED versions.
# Usage: npm run test:node-red-versions [-- <version>...]
VERSIONS=("$@")
[ ${#VERSIONS[@]} -eq 0 ] && VERSIONS=(3.1 4.1 5)

restore() {
    hash -r
    echo "### Restoring pinned dependencies. ###"
    npm ci --no-audit --no-fund
}
trap restore EXIT

FAILED=()
for version in "${VERSIONS[@]}"; do
    echo "### Node-RED $version ###"
    npm install --no-save --no-audit --no-fund "node-red@$version" || exit 1
    hash -r # swapping Node-RED can remove a bundled npm that bash has cached
    npm run test:integration || FAILED+=("$version")
done

if [ ${#FAILED[@]} -gt 0 ]; then
    echo "### Failed on Node-RED: ${FAILED[*]} ###"
    exit 1
fi
echo "### Passed on Node-RED: ${VERSIONS[*]} ###"
