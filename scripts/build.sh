#!/bin/bash

npm run clean:artifacts && \
ts-node-esm ./scripts/typescript/build.mts
