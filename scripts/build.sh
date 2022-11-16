#!/bin/bash

npm run clean:artifacts && \
tsc --build --pretty && \
npm run build:copy-icons && \
npm run build:render-html && \
npm pack
